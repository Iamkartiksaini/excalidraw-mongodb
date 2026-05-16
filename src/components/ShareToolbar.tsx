"use client";

import { Cloud, Save, Loader2, Home } from "lucide-react";
import { useRouter } from "next/navigation";

interface ShareToolbarProps {
  title: string;
  setTitle: (title: string) => void;
  isLoggedIn: boolean;
  onSaveToCloud: () => void;
  onSaveToLocal: () => void;
  isSaving: boolean;
}

export default function ShareToolbar({
  title,
  setTitle,
  isLoggedIn,
  onSaveToCloud,
  onSaveToLocal,
  isSaving,
}: ShareToolbarProps) {
  const router = useRouter();

  return (
    <div
      className="absolute h-11 bottom-4 left-1/2 -translate-x-1/2 Island App-toolbar z-50 flex items-center gap-1.5 bg-white p-1 rounded-[.5rem] border border-[#e9ecef] pointer-events-auto"
      style={{
        boxShadow:
          "0px 0px .931014px 0px #0000002b, 0px 0px 3.12708px 0px #00000014, 0px 7px 14px 0px #0000000d",
      }}
    >
      <button
        onClick={() => router.push("/")}
        title="Go to Home"
        className="p-1.5 text-[#868e96] hover:text-[#1e1e1e] hover:bg-[#f8f9fa] rounded-lg transition-colors"
        aria-label="Go to Home"
      >
        <Home className="w-5 h-5" />
      </button>

      <div className="w-px h-5 bg-[#e9ecef] mx-1" />

      {/* Title */}
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.currentTarget.blur();
          }
        }}
        className="px-2 py-1 text-sm font-bold text-[#1e1e1e] border border-transparent hover:border-[#e9ecef] rounded-lg outline-none w-30 focus:w-52 transition-all bg-transparent"
        placeholder="Untitled..."
        style={{ fontFamily: "'Virgil', cursive" }}
        aria-label="Drawing title"
      />

      <div className="w-px h-5 bg-[#e9ecef] mx-1" />

      {/* Save options */}
      {isLoggedIn && (
        <button
          onClick={onSaveToCloud}
          disabled={isSaving}
          title="Save to Cloud"
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold text-[#6965db] hover:bg-[#f3f0ff] rounded-lg transition-colors disabled:opacity-40"
          style={{ fontFamily: "'Virgil', cursive" }}
        >
          {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Cloud className="w-4 h-4" />}
          Save to Cloud
        </button>
      )}

      <button
        onClick={onSaveToLocal}
        disabled={isSaving}
        title="Save to Local"
        className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold rounded-lg transition-colors disabled:opacity-40 ${
          isLoggedIn ? "text-[#e67700] hover:bg-[#fff9db]" : "text-[#6965db] hover:bg-[#f3f0ff]"
        }`}
        style={{ fontFamily: "'Virgil', cursive" }}
      >
        {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
        Save to Local
      </button>
    </div>
  );
}
