"use client";

import { Pencil, Cloud } from "lucide-react";

interface DrawingCardSkeletonProps {
  /**
   * "default" — neutral grey shimmer (local content)
   * "cloud"   — purple-tinted shimmer with cloud icon (cloud content)
   */
  variant?: "default" | "cloud";
}

export default function DrawingCardSkeleton({ variant = "default" }: DrawingCardSkeletonProps) {
  const isCloud = variant === "cloud";

  return (
    <div
      className="group bg-white border-2 border-[#e9ecef] flex flex-col shadow-sm relative overflow-hidden"
      style={{ borderRadius: "8px 2px 7px 3px / 3px 7px 2px 8px" }}
    >
      {/* Preview area skeleton */}
      <div
        className={[
          "aspect-4/3 border-b-2 border-dashed border-[#e9ecef] flex items-center justify-center relative",
          isCloud ? "bg-[#f3f0ff] animate-pulse" : "bg-[#f8f9fa] animate-pulse",
        ].join(" ")}
        style={{ borderRadius: "6px 2px 0px 0px / 3px 6px 0px 0px" }}
      >
        {isCloud ? (
          <Cloud className="w-8 h-8 text-[#c3bee8] opacity-50" />
        ) : (
          <Pencil className="w-8 h-8 text-[#dee2e6] opacity-30" />
        )}
      </div>

      <div
        className="p-4 bg-white flex justify-between items-start gap-2 relative"
        style={{ borderRadius: "0 0 7px 3px / 0 0 2px 8px" }}
      >
        <div className="flex-1 space-y-3">
          {/* Title skeleton */}
          <div
            className={[
              "h-6 rounded-md w-3/4 animate-pulse",
              isCloud ? "bg-[#ede9ff]" : "bg-[#f1f3f5]",
            ].join(" ")}
          />
          {/* Date skeleton */}
          <div
            className={[
              "h-3 rounded-md w-1/2 animate-pulse",
              isCloud ? "bg-[#ede9ff]" : "bg-[#f1f3f5]",
            ].join(" ")}
          />
        </div>

        {/* Options button skeleton */}
        <div
          className={[
            "h-8 w-8 rounded-md animate-pulse",
            isCloud ? "bg-[#ede9ff]" : "bg-[#f1f3f5]",
          ].join(" ")}
          style={{ borderRadius: "4px 8px 6px 4px / 6px 3px 5px 8px" }}
        />
      </div>

      {/* Shimmer sweep overlay */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className={[
            "absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite]",
            isCloud
              ? "bg-linear-to-r from-transparent via-[#6965db]/10 to-transparent"
              : "bg-linear-to-r from-transparent via-white/40 to-transparent",
          ].join(" ")}
        />
      </div>
    </div>
  );
}
