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

  const selectedCandidate =
    candidates.find((c) => c.fileName === selectedFileName) || null;

  if (!candidates || candidates.length === 0) {
    return (
      <div className="w-full rounded-[12px] border border-[#E8E6E1] bg-[#FFFFFF] p-8 text-center shadow-xs">
        <p className="text-sm font-['Inter'] text-[#737373]">
          No candidate results available yet.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6 font-['Inter'] text-[#141414]">
      {/* Header section */}
      <div className="flex items-center justify-between px-1">
        <div>
          <h2 className="font-['Space_Grotesk'] text-xl font-bold text-[#141414] tracking-tight">
            Ranked Candidates
          </h2>
          <p className="text-xs text-[#737373] mt-0.5">
            {candidates.length} {candidates.length === 1 ? "candidate" : "candidates"} evaluated • Click a card to view detailed breakdown
          </p>
        </div>
      </div>

      {/* Vertical Card List */}
      <div className="space-y-3.5">
        {candidates.map((candidate, idx) => {
          const isSelected = selectedFileName === candidate.fileName;
          const isFailed = candidate.scoringFailed || false;
          const isRetrying = retryingFileNames.includes(candidate.fileName);
          const theme = MATCH_THEME[candidate.matchLevel] || MATCH_THEME.Weak;
          const initials = getInitials(candidate.fullName);
          const reasoningExcerpt =
            candidate.reasoning.length > 140
              ? `${candidate.reasoning.substring(0, 140)}...`
              : candidate.reasoning;

          return (
            <div
              key={`${candidate.fileName}-${idx}`}
              onClick={() => setSelectedFileName(candidate.fileName)}
              className={`relative overflow-hidden rounded-[12px] border bg-[#FFFFFF] transition-all duration-200 cursor-pointer ${
                isSelected
                  ? "border-[#141414] shadow-md ring-1 ring-[#141414]"
                  : "border-[#E8E6E1] hover:border-[#D0CDC5] hover:shadow-md shadow-xs"
              }`}
            >
              {/* 4px Left Border Accent Stripe */}
              <div
                className={`absolute left-0 top-0 bottom-0 w-[4px] ${
                  isFailed ? "bg-[#B23A3A]" : theme.stripeColor
                }`}
              />

              <div className="pl-6 pr-5 py-4 sm:py-5 flex flex-col gap-3">
                {/* Top Row: Avatar, Name & Meta, Match Badge */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3.5 min-w-0">
                    {/* Initials Avatar */}
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-['Space_Grotesk'] text-xs font-bold shrink-0 border ${
                        isFailed
                          ? "bg-[#F9EAEA] text-[#B23A3A] border-[#B23A3A35]"
                          : theme.avatarBg
                      }`}
                    >
                      {initials}
                    </div>

                    {/* Full Name & File */}
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-['Space_Grotesk'] font-bold text-base text-[#141414] truncate">
                          {candidate.fullName || "Unknown"}
                        </h3>
                        <span className="inline-flex items-center rounded-md bg-[#F4F3F0] px-2 py-0.5 text-[11px] font-medium text-[#525252]">
                          {candidate.yearsOfExperience}{" "}
                          {candidate.yearsOfExperience === 1 ? "yr" : "yrs"} exp
                        </span>
                      </div>
                      {candidate.fileName && (
                        <p className="text-xs text-[#8A8A8A] truncate font-normal mt-0.5">
                          {candidate.fileName}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Match Level Pill */}
                  {isFailed ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold shrink-0 bg-[#F9EAEA] text-[#B23A3A] border-[#B23A3A30]">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#B23A3A]" />
                      Scoring Failed
                    </span>
                  ) : (
                    <span
                      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold shrink-0 ${theme.badge}`}
                    >
                      {candidate.matchLevel}
                    </span>
                  )}
                </div>

                {/* Score Progress Bar or Retry Button */}
                {isFailed ? (
                  <div className="flex items-center justify-between gap-3 pt-1 flex-wrap">
                    <div className="flex items-center gap-1.5 text-xs text-[#B23A3A] font-medium">
                      <svg
                        className="w-4 h-4 text-[#B23A3A] shrink-0"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                        />
                      </svg>
                      <span>Evaluation incomplete</span>
                    </div>

                    <button
                      type="button"
                      disabled={isRetrying}
                      onClick={(e) => {
                        e.stopPropagation();
                        onRetryCandidate?.(candidate);
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-['Space_Grotesk'] font-bold rounded-lg border border-[#E8E6E1] bg-[#FFFFFF] hover:bg-[#F4F3F0] active:scale-[0.98] text-[#141414] transition cursor-pointer shadow-xs disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {isRetrying ? (
                        <>
                          <svg
                            className="animate-spin h-3.5 w-3.5 text-[#E4572E]"
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
                          <span>Scoring...</span>
                        </>
                      ) : (
                        <>
                          <svg
                            className="w-3.5 h-3.5 text-[#525252]"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                            />
                          </svg>
                          <span>Retry scoring</span>
                        </>
                      )}
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 pt-1">
                    <div className="flex-1 h-2 bg-[#F0EFEA] rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${theme.barColor}`}
                        style={{ width: `${Math.min(100, Math.max(0, candidate.matchScore))}%` }}
                      />
                    </div>
                    <span className="font-['Space_Grotesk'] text-xs font-bold text-[#141414] shrink-0 min-w-[52px] text-right">
                      {candidate.matchScore}
                      <span className="text-[#8A8A8A] font-normal text-[11px]">/100</span>
                    </span>
                  </div>
                )}

                {/* Reasoning Excerpt */}
                <p className="text-xs text-[#666666] leading-relaxed line-clamp-2">
                  {reasoningExcerpt || "No assessment details provided."}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Restyled Detail Panel */}
      {selectedCandidate && (
        <div className="rounded-[12px] border border-[#E8E6E1] bg-[#FFFFFF] shadow-lg p-6 sm:p-8 relative transition-all duration-200 animate-in fade-in">
          {/* Detail Header */}
          <div className="flex items-start justify-between border-b border-[#EFECE6] pb-5">
            <div className="flex items-center gap-4">
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center font-['Space_Grotesk'] text-sm font-bold shrink-0 border ${
                  (MATCH_THEME[selectedCandidate.matchLevel] || MATCH_THEME.Weak).avatarBg
                }`}
              >
                {getInitials(selectedCandidate.fullName)}
              </div>
              <div>
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h3 className="font-['Space_Grotesk'] text-2xl font-bold text-[#141414]">
                    {selectedCandidate.fullName || "Candidate Details"}
                  </h3>
                  <span
                    className={`inline-flex items-center rounded-full border px-3 py-0.5 text-xs font-semibold ${
                      selectedCandidate.scoringFailed
                        ? "bg-[#F9EAEA] text-[#B23A3A] border-[#B23A3A30]"
                        : (MATCH_THEME[selectedCandidate.matchLevel] || MATCH_THEME.Weak).badge
                    }`}
                  >
                    {selectedCandidate.scoringFailed
                      ? "Scoring Failed"
                      : `${selectedCandidate.matchLevel} Match`}
                  </span>
                </div>
                <p className="text-xs text-[#737373] mt-1 flex items-center gap-2">
                  <span>File: {selectedCandidate.fileName}</span>
                  <span>•</span>
                  <span>
                    {selectedCandidate.yearsOfExperience}{" "}
                    {selectedCandidate.yearsOfExperience === 1 ? "year" : "years"} of experience
                  </span>
                </p>
              </div>
            </div>

            {/* Close Button */}
            <button
              type="button"
              onClick={() => setSelectedFileName(null)}
              className="rounded-lg p-2 text-[#8A8A8A] hover:bg-[#F4F3F0] hover:text-[#141414] transition cursor-pointer"
              aria-label="Close candidate details"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <div className="mt-6 space-y-6">
            {/* Retry Banner in Detail View if failed */}
            {selectedCandidate.scoringFailed && (
              <div className="rounded-[10px] border border-[#B23A3A30] bg-[#F9EAEA] p-4 flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-2 text-xs text-[#B23A3A] font-medium">
                  <svg
                    className="w-4 h-4 text-[#B23A3A] shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                  <span>Candidate scoring was not completed successfully.</span>
                </div>
                <button
                  type="button"
                  disabled={retryingFileNames.includes(selectedCandidate.fileName)}
                  onClick={() => onRetryCandidate?.(selectedCandidate)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-['Space_Grotesk'] font-bold rounded-lg border border-[#E8E6E1] bg-[#FFFFFF] hover:bg-[#F4F3F0] text-[#141414] transition cursor-pointer shadow-xs disabled:opacity-60 disabled:cursor-not-allowed shrink-0"
                >
                  {retryingFileNames.includes(selectedCandidate.fileName) ? (
                    <>
                      <svg
                        className="animate-spin h-3.5 w-3.5 text-[#E4572E]"
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
                      <span>Scoring...</span>
                    </>
                  ) : (
                    <>
                      <svg
                        className="w-3.5 h-3.5 text-[#525252]"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                        />
                      </svg>
                      <span>Retry scoring</span>
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Score & Summary Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Score Card */}
              <div className="md:col-span-1 rounded-[12px] bg-[#FBFAF8] p-5 border border-[#E8E6E1] flex flex-col items-center justify-center text-center">
                <span className="text-[11px] uppercase font-bold tracking-wider text-[#737373]">
                  Match Score
                </span>
                <div className="mt-2 flex items-baseline gap-1 font-['Space_Grotesk']">
                  <span
                    className="text-4xl font-extrabold"
                    style={{
                      color:
                        (MATCH_THEME[selectedCandidate.matchLevel] || MATCH_THEME.Weak).color,
                    }}
                  >
                    {selectedCandidate.matchScore}
                  </span>
                  <span className="text-sm text-[#8A8A8A] font-medium">/100</span>
                </div>
                <span
                  className={`mt-2.5 inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold ${
                    (MATCH_THEME[selectedCandidate.matchLevel] || MATCH_THEME.Weak).badge
                  }`}
                >
                  {selectedCandidate.matchLevel} Match
                </span>
              </div>

              {/* Summary Card */}
              <div className="md:col-span-3 rounded-[12px] bg-[#FBFAF8] p-5 border border-[#E8E6E1]">
                <h4 className="text-[11px] uppercase font-bold tracking-wider text-[#737373] mb-1.5 font-['Space_Grotesk']">
                  Candidate Summary
                </h4>
                <p className="text-sm text-[#333333] leading-relaxed">
                  {selectedCandidate.summary || "No summary provided."}
                </p>
              </div>
            </div>

            {/* Evaluation Reasoning */}
            <div>
              <h4 className="font-['Space_Grotesk'] text-sm font-bold text-[#141414] mb-2">
                Match Evaluation & Reasoning
              </h4>
              <div className="rounded-[12px] bg-[#FBFAF8] border border-[#E8E6E1] p-4">
                <p className="text-sm text-[#333333] leading-relaxed">
                  {selectedCandidate.reasoning || "No evaluation details available."}
                </p>
              </div>
            </div>

            {/* Strengths & Missing Skills */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Strengths */}
              <div className="rounded-[12px] border border-[#2D7A4F30] bg-[#EBF5EE]/50 p-4">
                <h4 className="font-['Space_Grotesk'] text-sm font-bold text-[#2D7A4F] mb-3 flex items-center gap-2">
                  <svg
                    className="w-4 h-4 text-[#2D7A4F] shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2.5"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  Candidate Strengths
                </h4>
                {selectedCandidate.strengths && selectedCandidate.strengths.length > 0 ? (
                  <ul className="space-y-2">
                    {selectedCandidate.strengths.map((strength, i) => (
                      <li
                        key={i}
                        className="text-xs text-[#1F5436] flex items-start gap-2 leading-relaxed"
                      >
                        <span className="text-[#2D7A4F] font-bold">•</span>
                        <span>{strength}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-[#737373] italic">None highlighted.</p>
                )}
              </div>

              {/* Missing Skills */}
              <div className="rounded-[12px] border border-[#E4572E30] bg-[#FDF0EC]/60 p-4">
                <h4 className="font-['Space_Grotesk'] text-sm font-bold text-[#E4572E] mb-3 flex items-center gap-2">
                  <svg
                    className="w-4 h-4 text-[#E4572E] shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2.5"
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                  Missing Skills & Gaps
                </h4>
                {selectedCandidate.missingSkills && selectedCandidate.missingSkills.length > 0 ? (
                  <ul className="space-y-2">
                    {selectedCandidate.missingSkills.map((skill, i) => (
                      <li
                        key={i}
                        className="text-xs text-[#9B361B] flex items-start gap-2 leading-relaxed"
                      >
                        <span className="text-[#E4572E] font-bold">•</span>
                        <span>{skill}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-[#2D7A4F] font-medium">
                    No critical skill gaps identified.
                  </p>
                )}
              </div>
            </div>

            {/* Skills & Tools Tags */}
            <div className="space-y-4">
              {/* Skills */}
              <div>
                <h4 className="text-[11px] uppercase font-bold tracking-wider text-[#737373] mb-2 font-['Space_Grotesk']">
                  Skills
                </h4>
                {selectedCandidate.skills && selectedCandidate.skills.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {selectedCandidate.skills.map((skill, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center rounded-md bg-[#F4F3F0] px-2.5 py-1 text-xs font-medium text-[#141414] border border-[#E8E6E1]"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-[#737373]">None listed.</p>
                )}
              </div>

              {/* Tools & Frameworks */}
              <div>
                <h4 className="text-[11px] uppercase font-bold tracking-wider text-[#737373] mb-2 font-['Space_Grotesk']">
                  Tools & Technologies
                </h4>
                {selectedCandidate.tools && selectedCandidate.tools.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {selectedCandidate.tools.map((tool, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center rounded-md bg-[#F4F3F0] px-2.5 py-1 text-xs font-medium text-[#141414] border border-[#E8E6E1]"
                      >
                        {tool}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-[#737373]">None listed.</p>
                )}
              </div>
            </div>

            {/* Education & Certifications */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-[#EFECE6] pt-4">
              {/* Education */}
              <div>
                <h4 className="text-[11px] uppercase font-bold tracking-wider text-[#737373] mb-1 font-['Space_Grotesk']">
                  Education
                </h4>
                <p className="text-sm text-[#141414]">
                  {selectedCandidate.education || "Not specified"}
                </p>
              </div>

              {/* Certifications */}
              <div>
                <h4 className="text-[11px] uppercase font-bold tracking-wider text-[#737373] mb-1 font-['Space_Grotesk']">
                  Certifications
                </h4>
                {selectedCandidate.certifications && selectedCandidate.certifications.length > 0 ? (
                  <ul className="space-y-1">
                    {selectedCandidate.certifications.map((cert, i) => (
                      <li key={i} className="text-sm text-[#141414]">
                        • {cert}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-[#737373]">None listed</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
