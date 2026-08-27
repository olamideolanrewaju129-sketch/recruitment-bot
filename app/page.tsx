"use client";

import { useState } from "react";
import Link from "next/link";

interface SampleCandidate {
  id: string;
  name: string;
  role: string;
  experience: number;
  matchScore: number;
  matchLevel: "Strong" | "Medium" | "Weak";
  summary: string;
  strengths: string[];
  missingSkills: string[];
  skills: string[];
}

const SAMPLE_ROLES = [
  {
    title: "Senior Full-Stack Engineer (Next.js & AI)",
    dept: "Engineering",
    description:
      "Looking for a Senior Full-Stack Engineer with 5+ years experience with Next.js, TypeScript, Node.js, and integrating LLMs (OpenAI/Gemini APIs). Experience with TailwindCSS, cloud deployments, and Vector DBs is a plus.",
    candidates: [
      {
        id: "cand-1",
        name: "Alex Rivera",
        role: "Full-Stack AI Developer",
        experience: 6,
        matchScore: 95,
        matchLevel: "Strong" as const,
        summary:
          "6 years building scalable web applications. Extensive experience with Next.js App Router, TypeScript, Tailwind, and Gemini API integration.",
        strengths: [
          "6+ years full-stack TypeScript & Next.js production experience",
          "Built multi-tenant LLM agents with Google Gemini API",
          "Strong UI/UX design background with Tailwind CSS",
        ],
        missingSkills: ["Vector database experience not explicitly detailed"],
        skills: ["Next.js", "TypeScript", "React", "Node.js", "Gemini API", "PostgreSQL", "TailwindCSS"],
      },
      {
        id: "cand-2",
        name: "Samantha Vance",
        role: "Frontend Engineer",
        experience: 4,
        matchScore: 78,
        matchLevel: "Medium" as const,
        summary:
          "4 years frontend development focused on React, Next.js, and CSS design systems. Basic familiarity with backend APIs.",
        strengths: [
          "Proficient in React, Next.js, and TypeScript frontend development",
          "Strong responsive UI architecture and modern web design",
        ],
        missingSkills: [
          "Needs more backend Node.js API development experience",
          "No direct LLM or Gemini API integration listed",
        ],
        skills: ["React", "Next.js", "TypeScript", "TailwindCSS", "HTML5", "GraphQL"],
      },
      {
        id: "cand-3",
        name: "Jordan Hayes",
        role: "Junior Web Developer",
        experience: 1,
        matchScore: 42,
        matchLevel: "Weak" as const,
        summary:
          "Recent bootcamp graduate with foundational JavaScript and Python skills. Eager to learn modern web frameworks.",
        strengths: ["Fast learner with foundational JavaScript and Git version control"],
        missingSkills: [
          "Below 5+ years experience requirement (has 1 year)",
          "Lacks production Next.js App Router experience",
          "No LLM or AI workflow integration background",
        ],
        skills: ["JavaScript", "Python", "HTML/CSS", "Git", "Bootstrap"],
      },
    ],
  },
  {
    title: "AI Product Manager",
    dept: "Product",
    description:
      "Seeking a Product Manager with 4+ years shipping AI/ML consumer and B2B products. Must have experience with user metrics, agile roadmapping, and AI safety.",
    candidates: [
      {
        id: "cand-4",
        name: "Elena Rostova",
        role: "Senior AI Product Lead",
        experience: 5,
        matchScore: 92,
        matchLevel: "Strong" as const,
        summary:
          "5 years product management scaling generative AI tools from 0 to 1M+ active users. Deep domain knowledge in LLM benchmarks and user retention.",
        strengths: [
          "5 years leading cross-functional AI product teams",
          "Proven track record scaling LLM products to 1M+ users",
          "Expertise in AI safety, evals, and sprint roadmapping",
        ],
        missingSkills: ["B2B enterprise contract negotiation experience unverified"],
        skills: ["Product Roadmap", "LLM Evals", "Agile/Scrum", "User Retention", "SQL", "Figma"],
      },
      {
        id: "cand-5",
        name: "Marcus Brody",
        role: "Technical Project Coordinator",
        experience: 3,
        matchScore: 68,
        matchLevel: "Medium" as const,
        summary:
          "3 years managing software sprint cycles and user research interviews. Strong communicator with basic AI product exposure.",
        strengths: ["Strong sprint management and stakeholder alignment"],
        missingSkills: ["Lacks 4+ years requirement", "Limited hands-on generative AI product leadership"],
        skills: ["Jira", "User Interviews", "Agile", "Product Analytics"],
      },
    ],
  },
];

export default function Home() {
  const [selectedRoleIndex, setSelectedRoleIndex] = useState(0);
  const [selectedCandidateIndex, setSelectedCandidateIndex] = useState(0);

  const currentRole = SAMPLE_ROLES[selectedRoleIndex];
  const activeCandidate = currentRole.candidates[selectedCandidateIndex] || currentRole.candidates[0];

  return (
    <div className="flex flex-col w-full bg-[#FBFAF8] text-[#141414] overflow-hidden">
      {/* 1. HERO SECTION */}
      <section className="relative pt-12 pb-20 md:pt-20 md:pb-28 px-4 sm:px-6 lg:px-8 border-b border-[#E8E6E1] bg-radial-glow">
        <div className="mx-auto max-w-6xl">
          {/* Top Announcement Badge */}
          <div className="flex justify-center mb-6">
            <div className="inline-flex items-center gap-2.5 rounded-full bg-[#FFFFFF] px-4 py-1.5 text-xs font-semibold text-[#141414] shadow-xs border border-[#E8E6E1] animate-pulse-slow">
              <span className="flex h-2 w-2 rounded-full bg-[#E4572E]"></span>
              <span className="font-['Space_Grotesk'] text-[#E4572E] font-bold">TalentBot AI</span>
              <span className="text-[#A3A3A3]">•</span>
              <span className="text-[#525252]">Next-Generation AI Resume Screener</span>
            </div>
          </div>

          {/* Main Hero Header */}
          <div className="text-center max-w-3xl mx-auto space-y-5">
            <h1 className="font-['Space_Grotesk'] text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-[#141414] leading-[1.1]">
              Screen & Rank Candidates with{" "}
              <span className="gradient-text-orange">Neural AI Precision</span>
            </h1>
            <p className="font-['Inter'] text-base sm:text-lg text-[#666666] leading-relaxed max-w-2xl mx-auto">
              Transform unstructured PDF and TXT resumes into structured talent profiles and match scores in seconds. Powered by <strong className="text-[#141414] font-semibold">Google Gemini 3.6 Flash</strong>.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-3">
              <Link
                href="/upload"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 rounded-xl bg-[#141414] px-7 py-3.5 font-['Space_Grotesk'] text-sm font-bold text-white shadow-md hover:bg-[#2B2B2B] hover:shadow-lg transition-all active:scale-[0.98]"
              >
                <span>Launch Candidate Screener</span>
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2.5"
                    d="M14 5l7 7m0 0l-7 7m7-7H3"
                  />
                </svg>
              </Link>
              <a
                href="#live-demo"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-[#E8E6E1] bg-white px-6 py-3.5 font-['Space_Grotesk'] text-sm font-bold text-[#141414] hover:bg-[#F4F3F0] hover:border-[#D0CDC5] transition-all shadow-xs"
              >
                <span>Explore Interactive Demo</span>
                <svg
                  className="w-4 h-4 text-[#737373]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </a>
            </div>
          </div>

          {/* Hero Interactive Card Preview */}
          <div className="mt-14 max-w-4xl mx-auto">
            <div className="rounded-2xl border border-[#E8E6E1] bg-[#FFFFFF] p-6 sm:p-8 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#E4572E]/5 rounded-full blur-3xl pointer-events-none" />

              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-[#EFECE6]">
                <div className="flex items-center gap-3">
                  <div className="h-11 w-11 rounded-full bg-[#EBF5EE] text-[#2D7A4F] border border-[#2D7A4F]/20 flex items-center justify-center font-['Space_Grotesk'] font-bold text-sm">
                    AR
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-['Space_Grotesk'] text-lg font-bold text-[#141414]">
                        Alex Rivera
                      </h3>
                      <span className="rounded-md bg-[#F4F3F0] px-2 py-0.5 text-[11px] font-medium text-[#525252]">
                        6 yrs exp
                      </span>
                    </div>
                    <p className="text-xs text-[#737373]">resume_alex_rivera.pdf • Full-Stack AI Engineer</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end md:self-auto">
                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-[#737373] block">
                      AI Match Score
                    </span>
                    <span className="font-['Space_Grotesk'] text-2xl font-black text-[#2D7A4F]">
                      95<span className="text-xs font-normal text-[#8A8A8A]">/100</span>
                    </span>
                  </div>
                  <span className="rounded-full bg-[#EBF5EE] text-[#2D7A4F] border border-[#2D7A4F]/30 px-3 py-1 text-xs font-bold font-['Space_Grotesk']">
                    Strong Match
                  </span>
                </div>
              </div>

              {/* Card Body Details */}
              <div className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h4 className="text-[11px] uppercase font-bold tracking-wider text-[#737373] font-['Space_Grotesk'] mb-1.5">
                      Candidate Summary
                    </h4>
                    <p className="text-xs text-[#333333] leading-relaxed">
                      Senior engineer with 6 years building high-concurrency Next.js applications and integrating LLM workflows via Google Gemini API.
                    </p>
                  </div>

                  <div>
                    <h4 className="text-[11px] uppercase font-bold tracking-wider text-[#737373] font-['Space_Grotesk'] mb-1.5">
                      Verified Skills
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                      {["Next.js", "TypeScript", "Gemini API", "React", "PostgreSQL", "TailwindCSS"].map((s) => (
                        <span key={s} className="px-2 py-0.5 text-[11px] rounded bg-[#F4F3F0] text-[#141414] border border-[#E8E6E1] font-medium">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="rounded-xl border border-[#2D7A4F]/20 bg-[#EBF5EE]/50 p-3.5">
                    <h4 className="text-xs font-bold text-[#2D7A4F] font-['Space_Grotesk'] mb-1.5 flex items-center gap-1.5">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                      </svg>
                      Standout Strengths
                    </h4>
                    <p className="text-[11px] text-[#1F5436] leading-relaxed">
                      • 6+ years production TypeScript & Next.js App Router architecture
                      <br />• Hands-on Google Gemini model integration & prompt engineering
                    </p>
                  </div>

                  <div className="rounded-xl border border-[#E4572E]/20 bg-[#FDF0EC]/50 p-3.5">
                    <h4 className="text-xs font-bold text-[#E4572E] font-['Space_Grotesk'] mb-1.5 flex items-center gap-1.5">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01" />
                      </svg>
                      Identified Skill Gap
                    </h4>
                    <p className="text-[11px] text-[#9B361B] leading-relaxed">
                      • Vector database / RAG pipeline experience not explicitly detailed in resume
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. STATS & RECRUITER ROI */}
      <section className="py-12 bg-[#FFFFFF] border-b border-[#E8E6E1]">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="p-4">
              <span className="font-['Space_Grotesk'] text-3xl sm:text-4xl font-extrabold text-[#141414] block">
                85%
              </span>
              <span className="text-xs sm:text-sm text-[#737373] mt-1 block">
                Time Saved per Job Opening
              </span>
            </div>
            <div className="p-4">
              <span className="font-['Space_Grotesk'] text-3xl sm:text-4xl font-extrabold text-[#E4572E] block">
                &lt; 3s
              </span>
              <span className="text-xs sm:text-sm text-[#737373] mt-1 block">
                AI Extraction & Scoring Speed
              </span>
            </div>
            <div className="p-4">
              <span className="font-['Space_Grotesk'] text-3xl sm:text-4xl font-extrabold text-[#141414] block">
                100%
              </span>
              <span className="text-xs sm:text-sm text-[#737373] mt-1 block">
                Objective Metric Evaluation
              </span>
            </div>
            <div className="p-4">
              <span className="font-['Space_Grotesk'] text-3xl sm:text-4xl font-extrabold text-[#2D7A4F] block">
                Bulk
              </span>
              <span className="text-xs sm:text-sm text-[#737373] mt-1 block">
                PDF & TXT Multi-Resume Support
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 3. INTERACTIVE LIVE DEMO PLAYGROUND */}
      <section id="live-demo" className="py-20 px-4 sm:px-6 lg:px-8 border-b border-[#E8E6E1] bg-[#FBFAF8]">
        <div className="mx-auto max-w-6xl">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs uppercase font-bold tracking-wider text-[#E4572E] font-['Space_Grotesk'] block mb-2">
              Interactive Preview
            </span>
            <h2 className="font-['Space_Grotesk'] text-3xl sm:text-4xl font-bold text-[#141414] tracking-tight">
              Test Candidate Matching in Real-Time
            </h2>
            <p className="text-sm text-[#666666] mt-2">
              Select a target job opening and click through ranked candidates to see how the AI bot evaluates qualification fit and flags gaps.
            </p>
          </div>

          {/* Role Selection Tabs */}
          <div className="flex justify-center gap-2 sm:gap-3 mb-8 flex-wrap">
            {SAMPLE_ROLES.map((role, idx) => (
              <button
                key={role.title}
                onClick={() => {
                  setSelectedRoleIndex(idx);
                  setSelectedCandidateIndex(0);
                }}
                className={`px-4 py-2.5 rounded-xl font-['Space_Grotesk'] text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  selectedRoleIndex === idx
                    ? "bg-[#141414] text-white shadow-md"
                    : "bg-[#FFFFFF] text-[#525252] border border-[#E8E6E1] hover:bg-[#F4F3F0]"
                }`}
              >
                {role.title}
              </button>
            ))}
          </div>

          {/* Playground Container */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Col: Job Description Card */}
            <div className="lg:col-span-5 bg-[#FFFFFF] rounded-2xl border border-[#E8E6E1] p-6 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-2 mb-4">
                  <span className="text-[11px] uppercase font-bold tracking-wider text-[#737373] font-['Space_Grotesk']">
                    Target Job Specification
                  </span>
                  <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-[#F4F3F0] text-[#525252] border border-[#E8E6E1]">
                    {currentRole.dept}
                  </span>
                </div>
                <h3 className="font-['Space_Grotesk'] text-lg font-bold text-[#141414] mb-3">
                  {currentRole.title}
                </h3>
                <div className="bg-[#FBFAF8] rounded-xl p-4 border border-[#E8E6E1] text-xs text-[#444444] leading-relaxed whitespace-pre-line font-['Inter']">
                  {currentRole.description}
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-[#EFECE6] flex items-center justify-between">
                <span className="text-xs text-[#737373]">
                  {currentRole.candidates.length} candidate resumes submitted
                </span>
                <Link
                  href="/upload"
                  className="inline-flex items-center gap-1.5 text-xs font-bold font-['Space_Grotesk'] text-[#E4572E] hover:underline"
                >
                  <span>Score your own resumes →</span>
                </Link>
              </div>
            </div>

            {/* Right Col: Candidate Results / Ranking */}
            <div className="lg:col-span-7 space-y-4">
              {/* Candidate Selector Tabs */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {currentRole.candidates.map((cand, idx) => (
                  <button
                    key={cand.id}
                    onClick={() => setSelectedCandidateIndex(idx)}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-['Space_Grotesk'] font-bold border transition cursor-pointer shrink-0 ${
                      selectedCandidateIndex === idx
                        ? "bg-[#FFFFFF] border-[#141414] text-[#141414] shadow-xs"
                        : "bg-[#FBFAF8] border-[#E8E6E1] text-[#737373] hover:bg-[#FFFFFF]"
                    }`}
                  >
                    <span
                      className={`h-2 w-2 rounded-full ${
                        cand.matchLevel === "Strong"
                          ? "bg-[#2D7A4F]"
                          : cand.matchLevel === "Medium"
                          ? "bg-[#E4572E]"
                          : "bg-[#B23A3A]"
                      }`}
                    />
                    <span>{cand.name}</span>
                    <span className="text-[#8A8A8A] font-normal">
                      ({cand.matchScore}%)
                    </span>
                  </button>
                ))}
              </div>

              {/* Active Candidate Detail Card */}
              <div className="bg-[#FFFFFF] rounded-2xl border border-[#E8E6E1] p-6 shadow-sm space-y-5 animate-in fade-in duration-200">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-['Space_Grotesk'] text-xl font-bold text-[#141414]">
                        {activeCandidate.name}
                      </h4>
                      <span className="rounded-md bg-[#F4F3F0] px-2 py-0.5 text-[11px] font-medium text-[#525252]">
                        {activeCandidate.experience} years exp
                      </span>
                    </div>
                    <p className="text-xs text-[#737373] mt-0.5">{activeCandidate.role}</p>
                  </div>

                  <div className="text-right">
                    <span className="font-['Space_Grotesk'] text-2xl font-black block"
                      style={{
                        color:
                          activeCandidate.matchLevel === "Strong"
                            ? "#2D7A4F"
                            : activeCandidate.matchLevel === "Medium"
                            ? "#E4572E"
                            : "#B23A3A",
                      }}
                    >
                      {activeCandidate.matchScore}
                      <span className="text-xs font-normal text-[#8A8A8A]">/100</span>
                    </span>
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        activeCandidate.matchLevel === "Strong"
                          ? "bg-[#EBF5EE] text-[#2D7A4F]"
                          : activeCandidate.matchLevel === "Medium"
                          ? "bg-[#FDF0EC] text-[#E4572E]"
                          : "bg-[#F9EAEA] text-[#B23A3A]"
                      }`}
                    >
                      {activeCandidate.matchLevel} Match
                    </span>
                  </div>
                </div>

                {/* Score Progress Bar */}
                <div className="w-full bg-[#F0EFEA] h-2 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${activeCandidate.matchScore}%`,
                      backgroundColor:
                        activeCandidate.matchLevel === "Strong"
                          ? "#2D7A4F"
                          : activeCandidate.matchLevel === "Medium"
                          ? "#E4572E"
                          : "#B23A3A",
                    }}
                  />
                </div>

                {/* Summary */}
                <div>
                  <h5 className="text-[11px] uppercase font-bold tracking-wider text-[#737373] font-['Space_Grotesk'] mb-1">
                    AI Assessment Summary
                  </h5>
                  <p className="text-xs text-[#333333] leading-relaxed">
                    {activeCandidate.summary}
                  </p>
                </div>

                {/* Strengths & Missing Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div className="rounded-xl border border-[#2D7A4F]/20 bg-[#EBF5EE]/40 p-3">
                    <span className="text-xs font-bold text-[#2D7A4F] font-['Space_Grotesk'] block mb-1">
                      Standout Strengths
                    </span>
                    <ul className="text-[11px] text-[#1F5436] space-y-1">
                      {activeCandidate.strengths.map((s, i) => (
                        <li key={i}>• {s}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="rounded-xl border border-[#E4572E]/20 bg-[#FDF0EC]/40 p-3">
                    <span className="text-xs font-bold text-[#E4572E] font-['Space_Grotesk'] block mb-1">
                      Missing Skills & Concerns
                    </span>
                    <ul className="text-[11px] text-[#9B361B] space-y-1">
                      {activeCandidate.missingSkills.map((m, i) => (
                        <li key={i}>• {m}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Skills */}
                <div className="pt-2 border-t border-[#EFECE6]">
                  <span className="text-[11px] uppercase font-bold tracking-wider text-[#737373] font-['Space_Grotesk'] block mb-1.5">
                    Extracted Skills
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {activeCandidate.skills.map((s) => (
                      <span
                        key={s}
                        className="px-2 py-0.5 text-[11px] rounded bg-[#F4F3F0] text-[#141414] border border-[#E8E6E1] font-medium"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. KEY FEATURES */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 border-b border-[#E8E6E1] bg-[#FFFFFF]">
        <div className="mx-auto max-w-6xl">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs uppercase font-bold tracking-wider text-[#E4572E] font-['Space_Grotesk'] block mb-2">
              Features
            </span>
            <h2 className="font-['Space_Grotesk'] text-3xl sm:text-4xl font-bold text-[#141414] tracking-tight">
              Engineered for Frictionless Recruiter Workflows
            </h2>
            <p className="text-sm text-[#666666] mt-2">
              Say goodbye to scanning resumes manually. Our AI handles the heavy lifting so recruiters focus on interviewing top talent.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Feature 1 */}
            <div className="p-6 rounded-2xl bg-[#FBFAF8] border border-[#E8E6E1] card-hover-lift flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-[#141414] text-white flex items-center justify-center mb-4">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="font-['Space_Grotesk'] text-base font-bold text-[#141414] mb-2">
                  Bulk PDF & TXT Ingestion
                </h3>
                <p className="text-xs text-[#666666] leading-relaxed">
                  Drop multiple candidate resumes simultaneously. The built-in parser extracts text accurately from complex layouts with zero formatting loss.
                </p>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="p-6 rounded-2xl bg-[#FBFAF8] border border-[#E8E6E1] card-hover-lift flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-[#E4572E] text-white flex items-center justify-center mb-4">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="font-['Space_Grotesk'] text-base font-bold text-[#141414] mb-2">
                  Semantic Neural Scoring
                </h3>
                <p className="text-xs text-[#666666] leading-relaxed">
                  Goes far beyond basic keyword matching. Evaluates years of experience, technical competency, and relevance against nuanced job criteria.
                </p>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="p-6 rounded-2xl bg-[#FBFAF8] border border-[#E8E6E1] card-hover-lift flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-[#2D7A4F] text-white flex items-center justify-center mb-4">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="font-['Space_Grotesk'] text-base font-bold text-[#141414] mb-2">
                  Gap & Strength Analysis
                </h3>
                <p className="text-xs text-[#666666] leading-relaxed">
                  Automatically pinpoints exact missing skills, qualification gaps, and standout candidate highlights to inform screening interviews.
                </p>
              </div>
            </div>

            {/* Feature 4 */}
            <div className="p-6 rounded-2xl bg-[#FBFAF8] border border-[#E8E6E1] card-hover-lift flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-[#141414] text-white flex items-center justify-center mb-4">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
                  </svg>
                </div>
                <h3 className="font-['Space_Grotesk'] text-base font-bold text-[#141414] mb-2">
                  Ranked Leaderboard
                </h3>
                <p className="text-xs text-[#666666] leading-relaxed">
                  Automatically orders candidate results by overall match score (Strong, Medium, Weak), giving hiring managers an instant shortlist.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. HOW IT WORKS */}
      <section id="how-it-works" className="py-20 px-4 sm:px-6 lg:px-8 border-b border-[#E8E6E1] bg-[#FBFAF8]">
        <div className="mx-auto max-w-6xl">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs uppercase font-bold tracking-wider text-[#E4572E] font-['Space_Grotesk'] block mb-2">
              Workflow
            </span>
            <h2 className="font-['Space_Grotesk'] text-3xl sm:text-4xl font-bold text-[#141414] tracking-tight">
              3 Simple Steps to Shortlist Talent
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Step 1 */}
            <div className="rounded-2xl bg-[#FFFFFF] border border-[#E8E6E1] p-8 relative">
              <span className="font-['Space_Grotesk'] text-5xl font-black text-[#EFECE6] absolute top-6 right-6">
                01
              </span>
              <div className="w-10 h-10 rounded-xl bg-[#141414] text-white flex items-center justify-center font-['Space_Grotesk'] font-bold text-sm mb-5">
                1
              </div>
              <h3 className="font-['Space_Grotesk'] text-lg font-bold text-[#141414] mb-2">
                Paste Job Description
              </h3>
              <p className="text-xs text-[#666666] leading-relaxed">
                Add role responsibilities, required years of experience, programming languages, and desired qualifications.
              </p>
            </div>

            {/* Step 2 */}
            <div className="rounded-2xl bg-[#FFFFFF] border border-[#E8E6E1] p-8 relative">
              <span className="font-['Space_Grotesk'] text-5xl font-black text-[#EFECE6] absolute top-6 right-6">
                02
              </span>
              <div className="w-10 h-10 rounded-xl bg-[#E4572E] text-white flex items-center justify-center font-['Space_Grotesk'] font-bold text-sm mb-5">
                2
              </div>
              <h3 className="font-['Space_Grotesk'] text-lg font-bold text-[#141414] mb-2">
                Upload Resumes in Bulk
              </h3>
              <p className="text-xs text-[#666666] leading-relaxed">
                Drag and drop multiple candidate resumes in PDF or TXT format. Our parser extracts structured text instantly.
              </p>
            </div>

            {/* Step 3 */}
            <div className="rounded-2xl bg-[#FFFFFF] border border-[#E8E6E1] p-8 relative">
              <span className="font-['Space_Grotesk'] text-5xl font-black text-[#EFECE6] absolute top-6 right-6">
                03
              </span>
              <div className="w-10 h-10 rounded-xl bg-[#2D7A4F] text-white flex items-center justify-center font-['Space_Grotesk'] font-bold text-sm mb-5">
                3
              </div>
              <h3 className="font-['Space_Grotesk'] text-lg font-bold text-[#141414] mb-2">
                Receive Shortlist & Scores
              </h3>
              <p className="text-xs text-[#666666] leading-relaxed">
                Gemini AI parses, benchmarks, and ranks candidate scores from 0-100 with comprehensive strength and gap summaries.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. BOTTOM CTA BANNER */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-[#141414] text-white">
        <div className="mx-auto max-w-4xl text-center space-y-6">
          <h2 className="font-['Space_Grotesk'] text-3xl sm:text-4xl font-extrabold tracking-tight">
            Ready to Supercharge Your Recruitment Pipeline?
          </h2>
          <p className="text-sm text-[#A3A3A3] max-w-xl mx-auto">
            Experience lightning-fast resume evaluation. Test it live with your own resumes or our preloaded mock dataset.
          </p>
          <div className="pt-2">
            <Link
              href="/upload"
              className="inline-flex items-center gap-2.5 rounded-xl bg-[#E4572E] px-8 py-3.5 font-['Space_Grotesk'] text-sm font-bold text-white shadow-lg hover:bg-[#d04b24] transition active:scale-[0.98]"
            >
              <span>Launch Recruiter Screener</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
