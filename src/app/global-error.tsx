"use client";

import { useEffect } from "react";
import { AlertCircle, RefreshCcw } from "lucide-react";
import Link from "next/link";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error for debugging
    console.error("Global Error Caught:", error);
  }, [error]);

  return (
    <html lang="en">
      <body style={{ margin: 0 }}>
        <div className="flex flex-col items-center justify-center min-h-screen bg-[#fff5f5] px-4 text-center">
          <div className="relative mb-8">
            <div
              className="w-24 h-24 bg-[#ffe3e3] border-4 border-[#fa5252] flex items-center justify-center p-4 transform rotate-12"
              style={{
                borderRadius: "12px 4px 10px 4px / 4px 10px 4px 12px",
                backgroundColor: "#ffe3e3"
              }}
            >
              <AlertCircle className="w-12 h-12 text-[#fa5252]" />
            </div>
            <div className="absolute -top-3 -right-3 w-10 h-10 bg-[#fa5252] border-2 border-[#1e1e1e] rounded-full flex items-center justify-center text-white font-bold animate-pulse">
              CRIT
            </div>
          </div>

          <h1
            className="text-4xl font-bold text-[#1e1e1e] mb-2"
            style={{ fontFamily: "cursive" }}
          >
            A Critical Error Occurred
          </h1>

          <p className="text-xl text-[#868e96] mb-8 font-medium">
            The core application failed to initialize. Try resetting below.
          </p>

          <div
            className="bg-white border-2 border-[#fa5252] p-4 mb-8 max-w-lg mx-auto shadow-[4px_4px_0px_0px_rgba(250,82,82,1)]"
            style={{ borderRadius: "8px 2px 7px 3px / 3px 7px 2px 8px" }}
          >
            <p className="text-[#e03131] font-mono text-sm break-all">
              {error.message || "An irreversible error occurred at the root level."}
            </p>
          </div>

          <Link href={"/"}
            className="inline-flex items-center gap-2 px-8 py-4 bg-[#fa5252] border-2 border-[#1e1e1e] text-white hover:bg-[#e03131] transition-all shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-[2px] active:translate-y-[2px]"
            style={{
              borderRadius: "8px 2px 7px 3px / 3px 7px 2px 8px",
              fontFamily: "cursive",
              cursor: "pointer"
            }}
          >
            <RefreshCcw className="w-6 h-6" />
            <span className="font-bold text-xl uppercase tracking-wider">Attempt System Restart</span>
          </Link>

          <div className="mt-12 text-[#fa5252] opacity-30 tracking-widest text-xs uppercase">
            Root Level Handler · ID: {error.digest || "SYS-FAIL"}
          </div>
        </div>
      </body>
    </html>
  );
}
