"use client";

import { useEffect } from "react";
import BackToDashboard from "@/components/BackToDashboard";
import { AlertTriangle, RefreshCcw } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-var(--navbar-height,56px))] bg-[#fff5f5] px-4 text-center">
      <div className="relative mb-8">
        <div
          className="w-24 h-24 bg-[#ffe3e3] border-4 border-[#fa5252] flex items-center justify-center p-4 transform -rotate-3"
          style={{ borderRadius: "12px 4px 10px 4px / 4px 10px 4px 12px" }}
        >
          <AlertTriangle className="w-12 h-12 text-[#fa5252]" />
        </div>
      </div>

      <h1
        className="text-4xl font-bold text-[#1e1e1e] mb-2"
        style={{ fontFamily: "'Virgil', cursive" }}
      >
        Something went wrong!
      </h1>

      <div 
        className="bg-white border-2 border-[#fa5252] p-4 mb-8 max-w-lg mx-auto shadow-[4px_4px_0px_0px_rgba(250,82,82,1)]"
        style={{ borderRadius: "8px 2px 7px 3px / 3px 7px 2px 8px", fontFamily: "'Virgil', cursive" }}
      >
        <p className="text-[#e03131] font-mono text-sm break-all">
          {error.message || "An unexpected error occurred while rendering this page."}
        </p>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-4">
        <button
          onClick={() => reset()}
          className="inline-flex items-center gap-2 px-6 py-3 bg-[#fa5252] border-2 border-[#1e1e1e] text-white hover:bg-[#e03131] transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-[2px] active:translate-y-[2px]"
          style={{ borderRadius: "8px 2px 7px 3px / 3px 7px 2px 8px", fontFamily: "'Virgil', cursive" }}
        >
          <RefreshCcw className="w-5 h-5" />
          <span className="font-bold text-lg">Try Again</span>
        </button>

        <BackToDashboard />
      </div>

      <div className="mt-16 flex items-center gap-4 text-[#fa5252] opacity-50">
        <div className="h-px w-12 bg-[#ffa8a8]" />
        <span style={{ fontFamily: "'Virgil', cursive" }}>Error Code: {error.digest || "N/A"}</span>
        <div className="h-px w-12 bg-[#ffa8a8]" />
      </div>
    </div>
  );
}
