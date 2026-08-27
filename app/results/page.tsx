import Link from "next/link";

export default function ResultsPage() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 py-16 text-center">
      <div className="max-w-md w-full bg-white rounded-2xl border border-[#E8E6E1] p-8 shadow-sm">
        <div className="w-12 h-12 rounded-xl bg-[#E4572E]/10 text-[#E4572E] flex items-center justify-center mx-auto mb-4">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h2 className="font-['Space_Grotesk'] text-xl font-bold text-[#141414] mb-2">
          Candidate Screener Hub
        </h2>
        <p className="text-xs text-[#737373] leading-relaxed mb-6">
          To view ranked candidate scores, please upload your job description and resume files in the screener studio.
        </p>
        <Link
          href="/upload"
          className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#141414] px-5 py-3 font-['Space_Grotesk'] text-xs font-bold text-white hover:bg-[#2B2B2B] transition"
        >
          <span>Open Screener Studio</span>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </Link>
      </div>
    </div>
  );
}
