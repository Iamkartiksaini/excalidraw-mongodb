"use client";

import { Cloud } from "lucide-react";

interface CloudSectionShimmerHeaderProps {
  /** The section label shown when not loading */
  label: string;
  /** Whether the cloud fetch is in progress */
  isLoading: boolean;
}

/**
 * Renders a section header row.
 * While `isLoading`, it shows a shimmering "Syncing from cloud…" bar
 * with an animated gradient sweep in the project's purple palette.
 * Once loaded it renders the plain label text.
 */
export default function CloudSectionShimmerHeader({
  label,
  isLoading,
}: CloudSectionShimmerHeaderProps) {
  if (!isLoading) {
    return (
      <p className="text-xs font-semibold text-[#adb5bd] uppercase tracking-widest mb-4">
        {label}
      </p>
    );
  }

  return (
    <div className="flex items-center gap-2 mb-4">
      {/* Pulsing cloud icon */}
      <Cloud className="w-3.5 h-3.5 text-[#6965db] animate-pulse shrink-0" />

      {/* Shimmer bar replacing the label */}
      <div className="relative h-3 flex-1 max-w-[180px] overflow-hidden rounded-full bg-[#ede9ff]">
        <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.6s_ease-in-out_infinite] bg-linear-to-r from-transparent via-[#6965db]/30 to-transparent" />
      </div>

      {/* Small "Syncing…" label */}
      <span className="text-[10px] font-semibold text-[#9b96f0] tracking-wide animate-pulse">
        Syncing…
      </span>
    </div>
  );
}
