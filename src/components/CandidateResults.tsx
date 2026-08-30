"use client";

import React, { useState } from "react";
import { ScoredCandidate } from "@/src/types/candidate";

interface CandidateResultsProps {
  candidates: ScoredCandidate[];
  onRetryCandidate?: (candidate: ScoredCandidate) => void;
  retryingFileNames?: string[];
}

function getInitials(name: string): string {
  if (!name || name.trim() === "Unknown") return "CV";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

const MATCH_THEME = {
  Strong: {
    color: "#2D7A4F",
    stripeColor: "bg-[#2D7A4F]",
    barColor: "bg-[#2D7A4F]",
    avatarBg: "bg-[#EBF5EE] text-[#2D7A4F] border-[#2D7A4F35]",
    badge: "bg-[#EBF5EE] text-[#2D7A4F] border-[#2D7A4F30]",
    borderHighlight: "border-[#2D7A4F]",
  },
  Medium: {
    color: "#E4572E",
    stripeColor: "bg-[#E4572E]",
    barColor: "bg-[#E4572E]",
    avatarBg: "bg-[#FDF0EC] text-[#E4572E] border-[#E4572E35]",
    badge: "bg-[#FDF0EC] text-[#E4572E] border-[#E4572E30]",
    borderHighlight: "border-[#E4572E]",
  },
  Weak: {
    color: "#B23A3A",
    stripeColor: "bg-[#B23A3A]",
    barColor: "bg-[#B23A3A]",
    avatarBg: "bg-[#F9EAEA] text-[#B23A3A] border-[#B23A3A35]",
    badge: "bg-[#F9EAEA] text-[#B23A3A] border-[#B23A3A30]",
    borderHighlight: "border-[#B23A3A]",
  },
};

export default function CandidateResults({
  candidates,
  onRetryCandidate,
  retryingFileNames = [],
}: CandidateResultsProps) {
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "interview" | "outreach">("overview");
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [filterLevel, setFilterLevel] = useState<"All" | "Strong" | "Medium" | "Weak">("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [showCompareModal, setShowCompareModal] = useState(false);

  const filteredCandidates = candidates.filter((c) => {
    const matchesLevel = filterLevel === "All" || c.matchLevel === filterLevel;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      c.fullName.toLowerCase().includes(q) ||
      c.skills.some((s) => s.toLowerCase().includes(q)) ||
      c.tools.some((t) => t.toLowerCase().includes(q));
    return matchesLevel && matchesSearch;
  });

  const selectedCandidate =
    candidates.find((c) => c.fileName === selectedFileName) || null;

  const handleCopy = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleCopyEmail = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  const handleExportCSV = () => {
    const headers = [
      "Rank",
      "Full Name",
      "Match Score",
      "Match Level",
      "Years Experience",
      "Education",
      "Top Skills",
      "Standout Strengths",
      "Missing Requirements",
      "File Name",
    ];

    const rows = candidates.map((c, i) => [
      i + 1,
      `"${c.fullName.replace(/"/g, '""')}"`,
      c.matchScore,
      c.matchLevel,
      c.yearsOfExperience,
      `"${(c.education || "").replace(/"/g, '""')}"`,
      `"${(c.skills || []).slice(0, 5).join(", ").replace(/"/g, '""')}"`,
      `"${(c.strengths || []).join(" | ").replace(/"/g, '""')}"`,
      `"${(c.missingSkills || []).join(" | ").replace(/"/g, '""')}"`,
      `"${c.fileName}"`,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Candidate_Rankings_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!candidates || candidates.length === 0) {
    return (
      <div className="w-full rounded-2xl border border-[#E8E6E1] bg-[#FFFFFF] p-8 text-center shadow-xs">
        <p className="text-sm font-['Inter'] text-[#737373]">
          No candidate results available yet.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6 font-['Inter'] text-[#141414]">
      {/* Header section with Stats, Export & Compare */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#FFFFFF] p-5 rounded-2xl border border-[#E8E6E1] shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-['Space_Grotesk'] text-xl font-bold text-[#141414] tracking-tight">
              Ranked Candidate Shortlist
            </h2>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#E4572E]/10 text-[#E4572E] border border-[#E4572E]/20">
              AI Evaluated
            </span>
          </div>
          <p className="text-xs text-[#737373] mt-1">
            {candidates.length} {candidates.length === 1 ? "candidate" : "candidates"} evaluated • Sorted by semantic match confidence
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {candidates.length >= 2 && (
            <button
              type="button"
              onClick={() => setShowCompareModal(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-['Space_Grotesk'] font-bold bg-[#FBFAF8] hover:bg-[#F4F3F0] text-[#141414] border border-[#E8E6E1] transition shadow-xs cursor-pointer active:scale-[0.98]"
            >
              <svg className="w-3.5 h-3.5 text-[#E4572E]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <span>Side-by-Side Compare</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-['Space_Grotesk'] font-bold bg-[#141414] hover:bg-[#2B2B2B] text-white transition shadow-xs cursor-pointer active:scale-[0.98]"
          >
            <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Match Level Filter Pills */}
        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          {(["All", "Strong", "Medium", "Weak"] as const).map((lvl) => {
            const count =
              lvl === "All"
                ? candidates.length
                : candidates.filter((c) => c.matchLevel === lvl).length;
            return (
              <button
                key={lvl}
                type="button"
                onClick={() => setFilterLevel(lvl)}
                className={`px-3 py-1.5 rounded-lg text-xs font-['Space_Grotesk'] font-bold border transition cursor-pointer shrink-0 ${
                  filterLevel === lvl
                    ? "bg-[#141414] text-white border-[#141414]"
                    : "bg-[#FFFFFF] text-[#737373] border-[#E8E6E1] hover:bg-[#F4F3F0]"
                }`}
              >
                {lvl} ({count})
              </button>
            );
          })}
        </div>

        {/* Search input */}
        <div className="relative w-full sm:w-64">
          <input
            type="text"
            placeholder="Search candidate or skill..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs rounded-xl border border-[#E8E6E1] bg-[#FFFFFF] px-3.5 py-2 pl-9 text-[#141414] placeholder-[#A3A3A3] focus:border-[#E4572E] focus:outline-none"
          />
          <svg
            className="w-4 h-4 text-[#A3A3A3] absolute left-3 top-2.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
      </div>

      {/* Vertical Card List */}
      <div className="space-y-3.5">
        {filteredCandidates.map((candidate, idx) => {
          const isSelected = selectedFileName === candidate.fileName;
          const isFailed = candidate.scoringFailed || false;
          const isRetrying = retryingFileNames.includes(candidate.fileName);
          const theme = MATCH_THEME[candidate.matchLevel] || MATCH_THEME.Weak;
          const initials = getInitials(candidate.fullName);

          return (
            <div
              key={`${candidate.fileName}-${idx}`}
              onClick={() => {
                setSelectedFileName(candidate.fileName);
                setActiveTab("overview");
              }}
              className={`relative overflow-hidden rounded-2xl border bg-[#FFFFFF] transition-all duration-200 cursor-pointer ${
                isSelected
                  ? "border-[#141414] shadow-md ring-2 ring-[#141414]"
                  : "border-[#E8E6E1] hover:border-[#D0CDC5] hover:shadow-md shadow-xs"
              }`}
            >
              {/* Left Accent Stripe */}
              <div
                className={`absolute left-0 top-0 bottom-0 w-[5px] ${
                  isFailed ? "bg-[#B23A3A]" : theme.stripeColor
                }`}
              />

              <div className="pl-6 pr-5 py-4 sm:py-5 flex flex-col gap-3">
                {/* Top Row */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3.5 min-w-0">
                    {/* Rank Badge + Avatar */}
                    <div className="relative">
                      <div
                        className={`w-11 h-11 rounded-full flex items-center justify-center font-['Space_Grotesk'] text-xs font-bold shrink-0 border ${
                          isFailed
                            ? "bg-[#F9EAEA] text-[#B23A3A] border-[#B23A3A35]"
                            : theme.avatarBg
                        }`}
                      >
                        {initials}
                      </div>
                      <span className="absolute -top-1.5 -left-1.5 w-5 h-5 rounded-full bg-[#141414] text-white text-[10px] font-bold font-['Space_Grotesk'] flex items-center justify-center border-2 border-white">
                        #{idx + 1}
                      </span>
                    </div>

                    {/* Name & Experience */}
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-['Space_Grotesk'] font-bold text-base text-[#141414] truncate">
                          {candidate.fullName || "Candidate"}
                        </h3>
                        <span className="inline-flex items-center rounded-md bg-[#F4F3F0] px-2 py-0.5 text-[11px] font-medium text-[#525252]">
                          {candidate.yearsOfExperience} {candidate.yearsOfExperience === 1 ? "yr" : "yrs"} exp
                        </span>
                      </div>
                      <p className="text-xs text-[#8A8A8A] truncate font-normal mt-0.5">
                        {candidate.fileName}
                      </p>
                    </div>
                  </div>

                  {/* Score Pill */}
                  <div className="flex items-center gap-3">
                    <div className="text-right hidden sm:block">
                      <span className="font-['Space_Grotesk'] text-xl font-black block" style={{ color: theme.color }}>
                        {candidate.matchScore}<span className="text-xs text-[#8A8A8A] font-normal">/100</span>
                      </span>
                    </div>
                    <span
                      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-bold font-['Space_Grotesk'] shrink-0 ${theme.badge}`}
                    >
                      {candidate.matchLevel} Match
                    </span>
                  </div>
                </div>

                {/* Score Progress Bar */}
                <div className="flex items-center gap-3 pt-1">
                  <div className="flex-1 h-2 bg-[#F0EFEA] rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${theme.barColor}`}
                      style={{ width: `${Math.min(100, Math.max(0, candidate.matchScore))}%` }}
                    />
                  </div>
                  <span className="font-['Space_Grotesk'] text-xs font-bold sm:hidden text-[#141414]">
                    {candidate.matchScore}%
                  </span>
                </div>

                {/* Granular Sub-Scores Bar */}
                {candidate.categoryScores && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 border-t border-[#EFECE6] text-[11px]">
                    <div className="flex items-center justify-between px-2 py-1 rounded bg-[#FBFAF8] border border-[#E8E6E1]">
                      <span className="text-[#737373]">Tech Fit:</span>
                      <span className="font-bold text-[#141414] font-['Space_Grotesk']">{candidate.categoryScores.technical}%</span>
                    </div>
                    <div className="flex items-center justify-between px-2 py-1 rounded bg-[#FBFAF8] border border-[#E8E6E1]">
                      <span className="text-[#737373]">Experience:</span>
                      <span className="font-bold text-[#141414] font-['Space_Grotesk']">{candidate.categoryScores.experience}%</span>
                    </div>
                    <div className="flex items-center justify-between px-2 py-1 rounded bg-[#FBFAF8] border border-[#E8E6E1]">
                      <span className="text-[#737373]">Domain:</span>
                      <span className="font-bold text-[#141414] font-['Space_Grotesk']">{candidate.categoryScores.domain}%</span>
                    </div>
                    <div className="flex items-center justify-between px-2 py-1 rounded bg-[#FBFAF8] border border-[#E8E6E1]">
                      <span className="text-[#737373]">Education:</span>
                      <span className="font-bold text-[#141414] font-['Space_Grotesk']">{candidate.categoryScores.education}%</span>
                    </div>
                  </div>
                )}

                {/* Candidate Summary Snippet */}
                <p className="text-xs text-[#525252] leading-relaxed line-clamp-2">
                  {candidate.summary || candidate.reasoning}
                </p>

                {/* Matched Skill Pills */}
                <div className="flex flex-wrap gap-1.5 pt-1 items-center">
                  <span className="text-[10px] uppercase font-bold text-[#8A8A8A] font-['Space_Grotesk'] mr-1">
                    Top Skills:
                  </span>
                  {(candidate.skills || []).slice(0, 5).map((s, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 rounded text-[11px] font-medium bg-[#F4F3F0] text-[#141414] border border-[#E8E6E1]"
                    >
                      {s}
                    </span>
                  ))}
                  {candidate.skills && candidate.skills.length > 5 && (
                    <span className="text-[10px] text-[#8A8A8A]">
                      +{candidate.skills.length - 5} more
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Expanded Candidate Intelligence Studio */}
      {selectedCandidate && (
        <div className="rounded-2xl border border-[#141414] bg-[#FFFFFF] shadow-xl p-6 sm:p-8 relative transition-all animate-in fade-in">
          {/* Header */}
          <div className="flex items-start justify-between border-b border-[#EFECE6] pb-5">
            <div className="flex items-center gap-4">
              <div
                className={`w-14 h-14 rounded-2xl flex items-center justify-center font-['Space_Grotesk'] text-base font-bold shrink-0 border ${
                  (MATCH_THEME[selectedCandidate.matchLevel] || MATCH_THEME.Weak).avatarBg
                }`}
              >
                {getInitials(selectedCandidate.fullName)}
              </div>
              <div>
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h3 className="font-['Space_Grotesk'] text-2xl font-bold text-[#141414]">
                    {selectedCandidate.fullName}
                  </h3>
                  <span
                    className={`inline-flex items-center rounded-full border px-3 py-0.5 text-xs font-bold font-['Space_Grotesk'] ${
                      (MATCH_THEME[selectedCandidate.matchLevel] || MATCH_THEME.Weak).badge
                    }`}
                  >
                    {selectedCandidate.matchLevel} Match ({selectedCandidate.matchScore}/100)
                  </span>
                </div>
                <p className="text-xs text-[#737373] mt-1 flex items-center gap-2">
                  <span>File: {selectedCandidate.fileName}</span>
                  <span>•</span>
                  <span>{selectedCandidate.yearsOfExperience} years of verified experience</span>
                </p>
              </div>
            </div>

            {/* Close Button */}
            <button
              type="button"
              onClick={() => setSelectedFileName(null)}
              className="rounded-xl p-2 text-[#8A8A8A] hover:bg-[#F4F3F0] hover:text-[#141414] transition cursor-pointer"
              aria-label="Close candidate details"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 border-b border-[#EFECE6] pt-4 mb-6">
            <button
              type="button"
              onClick={() => setActiveTab("overview")}
              className={`pb-3 text-xs sm:text-sm font-['Space_Grotesk'] font-bold border-b-2 transition cursor-pointer inline-flex items-center gap-2 ${
                activeTab === "overview"
                  ? "border-[#E4572E] text-[#E4572E]"
                  : "border-transparent text-[#737373] hover:text-[#141414]"
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <span>Evaluation Breakdown</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("interview")}
              className={`pb-3 text-xs sm:text-sm font-['Space_Grotesk'] font-bold border-b-2 transition cursor-pointer inline-flex items-center gap-2 ${
                activeTab === "interview"
                  ? "border-[#E4572E] text-[#E4572E]"
                  : "border-transparent text-[#737373] hover:text-[#141414]"
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>AI Interview Kit</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("outreach")}
              className={`pb-3 text-xs sm:text-sm font-['Space_Grotesk'] font-bold border-b-2 transition cursor-pointer inline-flex items-center gap-2 ${
                activeTab === "outreach"
                  ? "border-[#E4572E] text-[#E4572E]"
                  : "border-transparent text-[#737373] hover:text-[#141414]"
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span>Recruiter Outreach</span>
            </button>
          </div>

          {/* TAB 1: OVERVIEW */}
          {activeTab === "overview" && (
            <div className="space-y-6 animate-in fade-in">
              {/* Score Sub-metrics Grid */}
              {selectedCandidate.categoryScores && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-4 rounded-xl bg-[#FBFAF8] border border-[#E8E6E1]">
                    <span className="text-[11px] font-bold uppercase text-[#737373] font-['Space_Grotesk'] block">
                      Technical Skills Fit
                    </span>
                    <span className="font-['Space_Grotesk'] text-2xl font-bold text-[#141414] mt-1 block">
                      {selectedCandidate.categoryScores.technical}%
                    </span>
                  </div>
                  <div className="p-4 rounded-xl bg-[#FBFAF8] border border-[#E8E6E1]">
                    <span className="text-[11px] font-bold uppercase text-[#737373] font-['Space_Grotesk'] block">
                      Experience Relevance
                    </span>
                    <span className="font-['Space_Grotesk'] text-2xl font-bold text-[#141414] mt-1 block">
                      {selectedCandidate.categoryScores.experience}%
                    </span>
                  </div>
                  <div className="p-4 rounded-xl bg-[#FBFAF8] border border-[#E8E6E1]">
                    <span className="text-[11px] font-bold uppercase text-[#737373] font-['Space_Grotesk'] block">
                      Domain & Tech Fit
                    </span>
                    <span className="font-['Space_Grotesk'] text-2xl font-bold text-[#141414] mt-1 block">
                      {selectedCandidate.categoryScores.domain}%
                    </span>
                  </div>
                  <div className="p-4 rounded-xl bg-[#FBFAF8] border border-[#E8E6E1]">
                    <span className="text-[11px] font-bold uppercase text-[#737373] font-['Space_Grotesk'] block">
                      Education & Certs
                    </span>
                    <span className="font-['Space_Grotesk'] text-2xl font-bold text-[#141414] mt-1 block">
                      {selectedCandidate.categoryScores.education}%
                    </span>
                  </div>
                </div>
              )}

              {/* Summary & Reasoning */}
              <div className="p-4 rounded-xl bg-[#FBFAF8] border border-[#E8E6E1]">
                <h4 className="font-['Space_Grotesk'] text-xs uppercase font-bold text-[#737373] mb-1.5 tracking-wider">
                  AI Evaluator Reasoning
                </h4>
                <p className="text-xs sm:text-sm text-[#333333] leading-relaxed">
                  {selectedCandidate.reasoning}
                </p>
              </div>

              {/* Strengths & Missing Skills */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-xl border border-[#2D7A4F]/25 bg-[#EBF5EE]/50 p-4">
                  <h4 className="font-['Space_Grotesk'] text-sm font-bold text-[#2D7A4F] mb-3 flex items-center gap-2">
                    <svg className="w-4 h-4 text-[#2D7A4F]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                    </svg>
                    Standout Strengths
                  </h4>
                  <ul className="space-y-2 text-xs text-[#1F5436]">
                    {(selectedCandidate.strengths || []).map((st, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="font-bold">•</span>
                        <span>{st}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="rounded-xl border border-[#E4572E]/25 bg-[#FDF0EC]/60 p-4">
                  <h4 className="font-['Space_Grotesk'] text-sm font-bold text-[#E4572E] mb-3 flex items-center gap-2">
                    <svg className="w-4 h-4 text-[#E4572E]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01" />
                    </svg>
                    Identified Gaps & Missing Skills
                  </h4>
                  <ul className="space-y-2 text-xs text-[#9B361B]">
                    {(selectedCandidate.missingSkills || []).map((ms, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="font-bold">•</span>
                        <span>{ms}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Skills and Tools list */}
              <div className="space-y-3">
                <div>
                  <h4 className="text-[11px] uppercase font-bold tracking-wider text-[#737373] mb-2 font-['Space_Grotesk']">
                    Extracted Skills
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {(selectedCandidate.skills || []).map((skill, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-1 text-xs font-medium rounded-lg bg-[#F4F3F0] text-[#141414] border border-[#E8E6E1]"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-[11px] uppercase font-bold tracking-wider text-[#737373] mb-2 font-['Space_Grotesk']">
                    Education & Credentials
                  </h4>
                  <p className="text-xs text-[#333333]">
                    {selectedCandidate.education || "Bachelor of Science / Equivalent Experience"}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: AI INTERVIEW QUESTIONS */}
          {activeTab === "interview" && (
            <div className="space-y-4 animate-in fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-['Space_Grotesk'] text-base font-bold text-[#141414]">
                    Tailored Interview Questions
                  </h4>
                  <p className="text-xs text-[#737373]">
                    Generated to probe {selectedCandidate.fullName}&apos;s specific background and verify potential skill gaps.
                  </p>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                {(selectedCandidate.suggestedInterviewQuestions || [
                  `Can you describe how you architected production systems using your primary stack?`,
                  `How do you handle technical debt and tight project deadlines?`,
                  `Tell us about your experience collaborating with cross-functional AI teams.`
                ]).map((q, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl bg-[#FBFAF8] border border-[#E8E6E1] flex items-start justify-between gap-4"
                  >
                    <div className="flex items-start gap-3">
                      <span className="w-6 h-6 rounded-full bg-[#141414] text-white text-xs font-bold font-['Space_Grotesk'] flex items-center justify-center shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <p className="text-xs sm:text-sm text-[#141414] leading-relaxed">
                        {q}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopy(q, idx)}
                      className="px-2.5 py-1 text-xs rounded font-['Space_Grotesk'] font-bold border border-[#E8E6E1] bg-white hover:bg-[#F4F3F0] text-[#141414] shrink-0 transition cursor-pointer"
                    >
                      {copiedIndex === idx ? "✓ Copied" : "Copy"}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: RECRUITER OUTREACH */}
          {activeTab === "outreach" && (
            <div className="space-y-4 animate-in fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-['Space_Grotesk'] text-base font-bold text-[#141414]">
                    AI Personalized Outreach Email Draft
                  </h4>
                  <p className="text-xs text-[#737373]">
                    Ready to copy and send to {selectedCandidate.fullName}.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    handleCopyEmail(
                      selectedCandidate.outreachEmailDraft ||
                        `Hi ${selectedCandidate.fullName},\n\nWe noticed your strong background and would love to connect for a quick 15-minute chat regarding our open role.`
                    )
                  }
                  className="px-3 py-1.5 rounded-lg text-xs font-['Space_Grotesk'] font-bold bg-[#141414] text-white hover:bg-[#2B2B2B] transition cursor-pointer"
                >
                  {copiedEmail ? "✓ Copied to Clipboard" : "Copy Full Email"}
                </button>
              </div>

              <div className="p-5 rounded-xl bg-[#FBFAF8] border border-[#E8E6E1] font-mono text-xs text-[#333333] whitespace-pre-line leading-relaxed">
                {selectedCandidate.outreachEmailDraft ||
                  `Hi ${selectedCandidate.fullName},\n\nI came across your profile and was impressed by your ${selectedCandidate.yearsOfExperience}+ years of experience and deep expertise in ${(selectedCandidate.skills || []).slice(0, 3).join(", ")}.\n\nWe are currently expanding our team and believe your background is a great match for our open position. Would you be open to a brief 15-minute introductory call this week?\n\nBest regards,\nRecruitment & Talent Team`}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Side-by-Side Candidate Comparator Modal */}
      {showCompareModal && (
        <div className="fixed inset-0 z-50 bg-[#141414]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FFFFFF] rounded-2xl border border-[#E8E6E1] max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 shadow-2xl space-y-6 animate-in fade-in">
            <div className="flex items-center justify-between border-b border-[#EFECE6] pb-4">
              <div>
                <h3 className="font-['Space_Grotesk'] text-xl font-bold text-[#141414]">
                  Side-by-Side Candidate Comparator
                </h3>
                <p className="text-xs text-[#737373]">
                  Comparing top shortlisted candidates head-to-head.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowCompareModal(false)}
                className="p-2 rounded-lg text-[#8A8A8A] hover:bg-[#F4F3F0] hover:text-[#141414] transition cursor-pointer"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {candidates.slice(0, 3).map((cand, i) => (
                <div
                  key={cand.fileName}
                  className="rounded-xl border border-[#E8E6E1] bg-[#FBFAF8] p-4 flex flex-col justify-between space-y-4"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold font-['Space_Grotesk'] text-[#E4572E]">
                        Rank #{i + 1}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          (MATCH_THEME[cand.matchLevel] || MATCH_THEME.Weak).badge
                        }`}
                      >
                        {cand.matchLevel}
                      </span>
                    </div>

                    <h4 className="font-['Space_Grotesk'] text-lg font-bold text-[#141414]">
                      {cand.fullName}
                    </h4>
                    <p className="text-xs text-[#737373] mt-0.5">
                      {cand.yearsOfExperience} yrs experience
                    </p>

                    <div className="mt-3 pt-3 border-t border-[#EFECE6]">
                      <span className="text-[10px] uppercase font-bold text-[#737373]">Match Score</span>
                      <div className="text-2xl font-black font-['Space_Grotesk'] text-[#141414]">
                        {cand.matchScore}%
                      </div>
                    </div>

                    <div className="mt-3 space-y-2 text-xs">
                      <div>
                        <span className="font-bold text-[#2D7A4F] text-[11px] block">Top Strength:</span>
                        <p className="text-[#1F5436] text-[11px]">
                          {(cand.strengths || [])[0] || "Strong foundational skills"}
                        </p>
                      </div>
                      <div>
                        <span className="font-bold text-[#E4572E] text-[11px] block">Primary Gap:</span>
                        <p className="text-[#9B361B] text-[11px]">
                          {(cand.missingSkills || [])[0] || "None highlighted"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedFileName(cand.fileName);
                      setShowCompareModal(false);
                    }}
                    className="w-full py-2 rounded-lg text-xs font-['Space_Grotesk'] font-bold bg-[#141414] text-white hover:bg-[#2B2B2B] transition"
                  >
                    View Deep Profile
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
