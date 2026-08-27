"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#E8E6E1] bg-[#FBFAF8]/90 backdrop-blur-md transition-all">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand / Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#141414] text-white shadow-xs group-hover:bg-[#E4572E] transition-colors">
            <svg
              className="h-5 w-5"
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
          <div className="flex flex-col">
            <span className="font-['Space_Grotesk'] text-lg font-bold tracking-tight text-[#141414] flex items-center gap-1.5">
              TalentAI <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded bg-[#E4572E]/10 text-[#E4572E] border border-[#E4572E]/20">Bot</span>
            </span>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-[#525252]">
          <Link
            href="/"
            className={`hover:text-[#141414] transition-colors ${
              pathname === "/" ? "text-[#141414] font-semibold" : ""
            }`}
          >
            Overview
          </Link>
          <a
            href="/#features"
            className="hover:text-[#141414] transition-colors"
          >
            Features
          </a>
          <a
            href="/#how-it-works"
            className="hover:text-[#141414] transition-colors"
          >
            How It Works
          </a>
          <a
            href="/#live-demo"
            className="hover:text-[#141414] transition-colors"
          >
            Live Demo
          </a>
        </nav>

        {/* Action Button */}
        <div className="flex items-center gap-3">
          <Link
            href="/upload"
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs sm:text-sm font-['Space_Grotesk'] font-bold transition-all shadow-xs active:scale-[0.98] ${
              pathname === "/upload"
                ? "bg-[#E4572E] text-white hover:bg-[#c9451e] shadow-[#E4572E]/25 shadow-md"
                : "bg-[#141414] text-white hover:bg-[#2B2B2B]"
            }`}
          >
            <span>Launch Screener</span>
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M14 5l7 7m0 0l-7 7m7-7H3"
              />
            </svg>
          </Link>
        </div>
      </div>
    </header>
  );
}
