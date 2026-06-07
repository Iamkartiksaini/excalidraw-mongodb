"use client";

import { useState } from "react";
import { RefreshCw, Check } from "lucide-react";

interface RefreshButtonProps {
  /** Called when the user clicks the button. Should return a Promise. */
  onRefresh: () => Promise<void>;
  /** Optional label shown next to the icon. Defaults to "Refresh". */
  label?: string;
}

type State = "idle" | "loading" | "success";

/**
 * A small button that shows a spinner while `onRefresh` is in-flight, then a
 * checkmark for 1.5 s, then returns to idle.
 *
 * The parent is responsible for clearing the relevant Zustand slice before
 * calling `onRefresh` so that the loading skeleton renders immediately.
 */
export default function RefreshButton({ onRefresh, label = "Refresh" }: RefreshButtonProps) {
  const [state, setState] = useState<State>("idle");

  const handleClick = async () => {
    if (state !== "idle") return;
    setState("loading");
    try {
      await onRefresh();
      setState("success");
      setTimeout(() => setState("idle"), 1500);
    } catch {
      setState("idle");
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={state !== "idle"}
      title={state === "loading" ? "Refreshing…" : label}
      className={[
        "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all border",
        "border-[#e9ecef] bg-white text-[#495057]",
        "hover:bg-[#f3f0ff] hover:text-[#6965db] hover:border-[#6965db]",
        "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-[#495057] disabled:hover:border-[#e9ecef]",
        state === "success" ? "text-green-600 border-green-300 bg-green-50" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {state === "loading" && (
        <RefreshCw className="w-3.5 h-3.5 animate-spin" aria-hidden="true" />
      )}
      {state === "success" && (
        <Check className="w-3.5 h-3.5 text-green-600" aria-hidden="true" />
      )}
      {state === "idle" && (
        <RefreshCw className="w-3.5 h-3.5" aria-hidden="true" />
      )}
      <span>{state === "success" ? "Updated!" : label}</span>
    </button>
  );
}
