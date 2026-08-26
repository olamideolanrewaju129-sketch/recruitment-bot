"use client";

import { useState, ChangeEvent, FormEvent } from "react";
import {
  CandidateScore,
  ExtractedCandidate,
  ScoredCandidate,
} from "@/src/types/candidate";
import CandidateResults from "@/src/components/CandidateResults";

interface ExtractedFile {
  fileName: string;
  text: string;
}

export default function UploadPage() {
  const [jobDescription, setJobDescription] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [extractedFiles, setExtractedFiles] = useState<ExtractedFile[]>([]);
  const [scoredCandidates, setScoredCandidates] = useState<ScoredCandidate[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [retryingFileNames, setRetryingFileNames] = useState<string[]>([]);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFiles = Array.from(e.target.files);
      setFiles((prevFiles) => {
        // Prevent duplicate files by filename and size
        const existingKeys = new Set(
          prevFiles.map((f) => `${f.name}-${f.size}`)
        );
        const newUniqueFiles = selectedFiles.filter(
          (f) => !existingKeys.has(`${f.name}-${f.size}`)
        );
        return [...prevFiles, ...newUniqueFiles];
      });
      // Reset input value so the same file can be re-added if removed
      e.target.value = "";
    }
  };

  const handleRemoveFile = (indexToRemove: number) => {
    const removedFile = files[indexToRemove];
    setFiles((prevFiles) =>
      prevFiles.filter((_, index) => index !== indexToRemove)
    );
    if (removedFile) {
      setExtractedFiles((prev) =>
        prev.filter((item) => item.fileName !== removedFile.name)
      );
      setScoredCandidates((prev) =>
        prev.filter((item) => item.fileName !== removedFile.name)
      );
    }
  };

  const extractTextFromTXT = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        resolve((reader.result as string) || "");
      };
      reader.onerror = () => {
        reject(reader.error || new Error(`Failed to read file ${file.name}`));
      };
      reader.readAsText(file);
    });
  };

  const extractTextFromPDF = async (file: File): Promise<string> => {
    const pdfjsLib = await import("pdfjs-dist");
    if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
      pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
    }
    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) });
    const pdf = await loadingTask.promise;
    let fullText = "";

    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item) => ("str" in item ? (item as { str: string }).str : ""))
        .join(" ");
      fullText += pageText + "\n";
    }

    return fullText.trim();
  };

  const extractFileContent = async (file: File): Promise<string> => {
    const fileName = file.name.toLowerCase();
    if (fileName.endsWith(".txt") || file.type === "text/plain") {
      return await extractTextFromTXT(file);
    } else if (fileName.endsWith(".pdf") || file.type === "application/pdf") {
      return await extractTextFromPDF(file);
    } else {
      return await extractTextFromTXT(file);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!isFormValid || isProcessing) return;

    setIsProcessing(true);
    setStatusMessage("Extracting text from files...");

    try {
      // 1. Extract raw text from all files
      const fileTextResults: ExtractedFile[] = [];

      for (const file of files) {
        try {
          const text = await extractFileContent(file);
          fileTextResults.push({ fileName: file.name, text });
        } catch (err) {
          console.warn(`Failed to extract text from file "${file.name}":`, err);
          fileTextResults.push({ fileName: file.name, text: "" });
        }
      }

      setExtractedFiles(fileTextResults);

      const finalCandidates: ScoredCandidate[] = [];
      const total = fileTextResults.length;

      // 2. Process each candidate: Extract structured data + Score against job description
      for (let i = 0; i < total; i++) {
        const item = fileTextResults[i];
        if (!item.text || !item.text.trim()) {
          console.warn(`Skipping extraction for "${item.fileName}" because no text was extracted.`);
          finalCandidates.push({
            fileName: item.fileName,
            rawText: item.text || "",
            fullName: "Unknown (extraction failed)",
            yearsOfExperience: 0,
            skills: [],
            education: "",
            certifications: [],
            tools: [],
            summary: "",
            matchScore: 0,
            matchLevel: "Weak",
            reasoning: "Could not extract candidate details from this file. Try re-uploading or check the file format.",
            missingSkills: [],
            strengths: [],
            scoringFailed: true,
          });
          continue;
        }

        // Add 800ms delay before extraction to avoid Gemini API rate limits
        await new Promise((resolve) => setTimeout(resolve, 800));

        // Step A: Extract candidate info
        setStatusMessage(`Extracting candidate ${i + 1} of ${total} (${item.fileName})...`);

        let extractedData: ExtractedCandidate | null = null;
        try {
          const extractRes = await fetch("/api/extract-candidate", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ resumeText: item.text }),
          });

          if (!extractRes.ok) {
            const errData = await extractRes.json().catch(() => ({}));
            console.warn(
              `Error extracting candidate details for "${item.fileName}":`,
              errData.error || extractRes.statusText
            );
          } else {
            extractedData = await extractRes.json();
          }
        } catch (extractErr) {
          console.warn(
            `Failed to call extract API for "${item.fileName}":`,
            extractErr
          );
        }

        if (!extractedData) {
          finalCandidates.push({
            fileName: item.fileName,
            rawText: item.text,
            fullName: "Unknown (extraction failed)",
            yearsOfExperience: 0,
            skills: [],
            education: "",
            certifications: [],
            tools: [],
            summary: "",
            matchScore: 0,
            matchLevel: "Weak",
            reasoning: "Could not extract candidate details from this file. Try re-uploading or check the file format.",
            missingSkills: [],
            strengths: [],
            scoringFailed: true,
          });
          continue;
        }

        // Add 800ms delay before scoring to avoid Gemini API rate limits
        await new Promise((resolve) => setTimeout(resolve, 800));

        // Step B: Score candidate against job description
        setStatusMessage(`Scoring candidate ${i + 1} of ${total} (${item.fileName})...`);

        let scoreData: CandidateScore = {
          matchScore: 0,
          matchLevel: "Weak",
          reasoning: "Candidate scoring failed: could not evaluate candidate against job description.",
          missingSkills: [],
          strengths: [],
        };
        let scoringFailed = false;

        try {
          const scoreRes = await fetch("/api/score-candidate", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              jobDescription,
              candidate: extractedData,
            }),
          });

          if (scoreRes.ok) {
            scoreData = await scoreRes.json();
            scoringFailed = false;
          } else {
            scoringFailed = true;
            const errData = await scoreRes.json().catch(() => ({}));
            console.warn(
              `Scoring failed for "${item.fileName}", preserving extracted profile with fallback score:`,
              errData.error || scoreRes.statusText
            );
          }
        } catch (scoreErr) {
          scoringFailed = true;
          console.warn(
            `Failed to call score API for "${item.fileName}", using fallback score:`,
            scoreErr
          );
        }

        finalCandidates.push({
          ...extractedData,
          ...scoreData,
          fileName: item.fileName,
          rawText: item.text,
          scoringFailed,
        });
      }

      // 3. Sort final results by matchScore descending (highest match first)
      finalCandidates.sort((a, b) => b.matchScore - a.matchScore);

      // Save into scoredCandidates state
      setScoredCandidates(finalCandidates);

      console.log("Job Description:", jobDescription);
      console.log("Final Scored Candidates (Sorted by matchScore desc):", finalCandidates);
    } catch (error) {
      console.error("Unexpected error during candidate analysis:", error);
    } finally {
      setIsProcessing(false);
      setStatusMessage("");
    }
  };

  const handleRetryCandidate = async (candidateToRetry: ScoredCandidate) => {
    if (!jobDescription || !jobDescription.trim()) {
      alert("Please ensure the job description is filled in to score candidates.");
      return;
    }

    setRetryingFileNames((prev) => [...prev, candidateToRetry.fileName]);

    try {
      let candidatePayload: ExtractedCandidate = {
        fullName: candidateToRetry.fullName,
        yearsOfExperience: candidateToRetry.yearsOfExperience,
        skills: candidateToRetry.skills,
        education: candidateToRetry.education,
        certifications: candidateToRetry.certifications,
        tools: candidateToRetry.tools,
        summary: candidateToRetry.summary,
      };

      // If extraction previously failed and raw text is available, retry extraction first
      if (
        candidateToRetry.fullName === "Unknown (extraction failed)" &&
        candidateToRetry.rawText &&
        candidateToRetry.rawText.trim()
      ) {
        const extractRes = await fetch("/api/extract-candidate", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ resumeText: candidateToRetry.rawText }),
        });

        if (extractRes.ok) {
          const freshExtracted: ExtractedCandidate = await extractRes.json();
          candidatePayload = freshExtracted;
        }
      }

      const scoreRes = await fetch("/api/score-candidate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          jobDescription,
          candidate: candidatePayload,
        }),
      });

      if (!scoreRes.ok) {
        const errData = await scoreRes.json().catch(() => ({}));
        throw new Error(errData.error || `HTTP ${scoreRes.status} scoring failed`);
      }

      const newScore: CandidateScore = await scoreRes.json();

      setScoredCandidates((prev) => {
        const updated = prev.map((c) => {
          if (c.fileName === candidateToRetry.fileName) {
            return {
              ...c,
              ...candidatePayload,
              matchScore: newScore.matchScore,
              matchLevel: newScore.matchLevel,
              reasoning: newScore.reasoning,
              strengths: newScore.strengths,
              missingSkills: newScore.missingSkills,
              scoringFailed: false,
            };
          }
          return c;
        });
        return [...updated].sort((a, b) => b.matchScore - a.matchScore);
      });
    } catch (err) {
      console.error(`Retry scoring failed for "${candidateToRetry.fileName}":`, err);
      setScoredCandidates((prev) =>
        prev.map((c) =>
          c.fileName === candidateToRetry.fileName
            ? { ...c, scoringFailed: true }
            : c
        )
      );
    } finally {
      setRetryingFileNames((prev) =>
        prev.filter((name) => name !== candidateToRetry.fileName)
      );
    }
  };

  const isFormValid = jobDescription.trim().length > 0 && files.length > 0;

  return (
    <div className="min-h-screen bg-[#FBFAF8] font-['Inter'] text-[#141414] py-12 px-4 sm:px-6 lg:px-8 flex flex-col items-center">
      <div className="w-full max-w-4xl space-y-8">
        {/* Upload Card */}
        <div className="w-full bg-[#FFFFFF] rounded-[12px] shadow-xs border border-[#E8E6E1] p-6 sm:p-8">
          <div className="mb-6">
            <h1 className="font-['Space_Grotesk'] text-2xl sm:text-3xl font-bold text-[#141414] tracking-tight">
              AI Candidate Screener & Matcher
            </h1>
            <p className="mt-1.5 text-sm text-[#737373]">
              Paste the target job description and upload candidate resumes (PDF or TXT) to evaluate and rank candidate fit.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Job Description Field */}
            <div>
              <label
                htmlFor="job-description"
                className="block text-xs uppercase font-bold tracking-wider text-[#525252] font-['Space_Grotesk'] mb-2"
              >
                Job Description
              </label>
              <textarea
                id="job-description"
                rows={6}
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste the job description, required skills, and qualifications here..."
                disabled={isProcessing}
                className="w-full rounded-[10px] border border-[#E8E6E1] bg-[#FFFFFF] px-4 py-3 text-sm text-[#141414] placeholder-[#A3A3A3] focus:border-[#E4572E] focus:outline-none focus:ring-1 focus:ring-[#E4572E] transition disabled:opacity-60"
              />
            </div>

            {/* CV Upload Field */}
            <div>
              <label className="block text-xs uppercase font-bold tracking-wider text-[#525252] font-['Space_Grotesk'] mb-2">
                Candidate CVs (.pdf, .txt)
              </label>
              <label
                htmlFor="cv-files"
                className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-[#E8E6E1] rounded-[10px] bg-[#FBFAF8] transition ${
                  isProcessing
                    ? "opacity-50 cursor-not-allowed"
                    : "cursor-pointer hover:bg-[#F4F3F0] hover:border-[#D0CDC5]"
                }`}
              >
                <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center px-4">
                  <svg
                    className="w-8 h-8 mb-2 text-[#E4572E]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                    />
                  </svg>
                  <p className="text-sm text-[#333333]">
                    <span className="font-semibold text-[#141414]">
                      Click to select files
                    </span>{" "}
                    or drag and drop
                  </p>
                  <p className="text-xs text-[#8A8A8A] mt-1">
                    PDF or TXT files (multiple resumes allowed)
                  </p>
                </div>
                <input
                  id="cv-files"
                  type="file"
                  multiple
                  disabled={isProcessing}
                  accept=".pdf,.txt,application/pdf,text/plain"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            </div>

            {/* Selected Files List */}
            {files.length > 0 && (
              <div>
                <h2 className="text-xs uppercase font-bold tracking-wider text-[#737373] font-['Space_Grotesk'] mb-2">
                  Selected Resumes ({files.length})
                </h2>
                <ul className="divide-y divide-[#EFECE6] rounded-[10px] border border-[#E8E6E1] max-h-48 overflow-y-auto bg-[#FFFFFF]">
                  {files.map((file, index) => (
                    <li
                      key={`${file.name}-${index}`}
                      className="flex items-center justify-between px-4 py-2.5 text-sm"
                    >
                      <div className="flex items-center gap-2.5 truncate pr-2">
                        <svg
                          className="w-4 h-4 text-[#8A8A8A] shrink-0"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                          />
                        </svg>
                        <span className="truncate text-[#141414]">
                          {file.name}
                        </span>
                      </div>
                      <button
                        type="button"
                        disabled={isProcessing}
                        onClick={() => handleRemoveFile(index)}
                        className="text-xs font-semibold text-[#B23A3A] hover:text-[#8E2828] shrink-0 transition disabled:opacity-50 cursor-pointer"
                        aria-label={`Remove ${file.name}`}
                      >
                        Remove
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                disabled={!isFormValid || isProcessing}
                className={`w-full py-3 px-4 rounded-[10px] font-['Space_Grotesk'] font-bold text-sm transition flex items-center justify-center gap-2 ${
                  isFormValid && !isProcessing
                    ? "bg-[#141414] text-[#FFFFFF] hover:bg-[#2B2B2B] cursor-pointer shadow-xs active:scale-[0.99]"
                    : "bg-[#EFECE6] text-[#A3A3A3] cursor-not-allowed"
                }`}
              >
                {isProcessing ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    {statusMessage || "Analyzing candidates..."}
                  </>
                ) : (
                  "Analyze Candidates"
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Results Section */}
        {scoredCandidates.length > 0 ? (
          <div className="w-full">
            <CandidateResults
              candidates={scoredCandidates}
              onRetryCandidate={handleRetryCandidate}
              retryingFileNames={retryingFileNames}
            />
          </div>
        ) : (
          <div className="w-full bg-[#FFFFFF] rounded-[12px] border border-[#E8E6E1] p-8 sm:p-10 text-center shadow-xs flex flex-col items-center justify-center">
            <div className="w-12 h-12 rounded-full bg-[#F4F3F0] border border-[#E8E6E1] flex items-center justify-center text-[#737373] mb-3.5">
              <svg
                className="w-6 h-6 text-[#737373]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.75"
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                />
              </svg>
            </div>
            <h3 className="font-['Space_Grotesk'] text-base font-bold text-[#141414] mb-1">
              No Analysis Yet
            </h3>
            <p className="font-['Inter'] text-sm text-[#737373] max-w-md leading-relaxed">
              Upload a job description and candidate resumes above, then click{" "}
              <span className="font-semibold text-[#141414]">Analyze Candidates</span> to see ranked results here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
