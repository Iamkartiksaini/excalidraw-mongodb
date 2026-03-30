"use client";

import { Pencil } from "lucide-react";

export default function DrawingCardSkeleton() {
  return (
    <div
      className="group bg-white border-2 border-[#e9ecef] flex flex-col shadow-sm relative overflow-hidden"
      style={{ borderRadius: "8px 2px 7px 3px / 3px 7px 2px 8px" }}
    >
      {/* Preview area skeleton */}
      <div
        className="aspect-4/3 bg-[#f8f9fa] border-b-2 border-dashed border-[#e9ecef] flex items-center justify-center relative animate-pulse"
        style={{ borderRadius: "6px 2px 0px 0px / 3px 6px 0px 0px" }}
      >
        <Pencil className="w-8 h-8 text-[#dee2e6] opacity-30" />
      </div>

      <div className="p-4 bg-white flex justify-between items-start gap-2 relative" style={{ borderRadius: "0 0 7px 3px / 0 0 2px 8px" }}>
        <div className="flex-1 space-y-3">
          {/* Title skeleton */}
          <div className="h-6 bg-[#f1f3f5] rounded-md w-3/4 animate-pulse" />
          {/* Date skeleton */}
          <div className="h-3 bg-[#f1f3f5] rounded-md w-1/2 animate-pulse" />
        </div>

        {/* Options button skeleton */}
        <div className="h-8 w-8 bg-[#f1f3f5] rounded-md animate-pulse" style={{ borderRadius: "4px 8px 6px 4px / 6px 3px 5px 8px" }} />
      </div>

      {/* Shimmer effect overlay */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/40 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
      </div>
    </div>
  );
}
