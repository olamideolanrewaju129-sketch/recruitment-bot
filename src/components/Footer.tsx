import Link from "next/link";

export default function Footer() {
  return (
    <footer className="w-full border-t border-[#E8E6E1] bg-[#FFFFFF] py-12 mt-auto">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Brand & Mission */}
          <div className="flex flex-col items-center md:items-start text-center md:text-left gap-1.5">
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#141414] text-white">
                <svg
                  className="h-3.5 w-3.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
              <span className="font-['Space_Grotesk'] text-sm font-bold text-[#141414]">
                TalentAI Screener
              </span>
            </div>
            <p className="text-xs text-[#737373] max-w-sm">
              Next-generation AI recruitment intelligence designed to parse resumes and accurately rank candidate match fit in seconds.
            </p>
          </div>

          {/* Badges / Tech Stack */}
          <div className="flex items-center gap-2 flex-wrap justify-center">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium bg-[#FBFAF8] text-[#525252] border border-[#E8E6E1]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#2D7A4F]"></span>
              Google Gemini 3.5 Flash Lite
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium bg-[#FBFAF8] text-[#525252] border border-[#E8E6E1]">
              Next.js 16 App Router
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium bg-[#FBFAF8] text-[#525252] border border-[#E8E6E1]">
              AI Candidate Intelligence
            </span>
          </div>

          {/* Links */}
          <div className="flex items-center gap-6 text-xs text-[#737373]">
            <Link href="/" className="hover:text-[#141414] transition-colors">
              Home
            </Link>
            <Link href="/upload" className="hover:text-[#141414] transition-colors">
              Candidate Screener
            </Link>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#141414] transition-colors"
            >
              GitHub
            </a>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-[#F0EFEA] text-center text-[11px] text-[#A3A3A3]">
          Built with precision for seamless recruiter workflows and AI-driven candidate evaluation.
        </div>
      </div>
    </footer>
  );
}
