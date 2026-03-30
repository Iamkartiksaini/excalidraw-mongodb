"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function BackToDashboard() {
  return (
    <Link
      href="/dashboard"
      className="inline-flex items-center gap-2 px-6 py-3 bg-white border-2 border-[#1e1e1e] text-[#1e1e1e] hover:bg-[#f3f0ff] hover:text-[#6965db] transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-[2px] active:translate-y-[2px]"
      style={{ borderRadius: "8px 2px 7px 3px / 3px 7px 2px 8px", fontFamily: "'Virgil', cursive" }}
    >
      <ArrowLeft className="w-5 h-5" />
      <span className="font-bold text-lg">Back to Dashboard</span>
    </Link>
  );
}
