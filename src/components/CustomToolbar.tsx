"use client";

import formatTimeDate from "@/lib/time-date-formatter";
import { ArrowLeft, Check, Globe, History, Loader2, Lock, Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function CustomToolbar({
    title,
    setTitle,
    handleTitleBlur,
    handleSave,
    isSaving,
    saveSuccess,
    isGuest,
    guestSavedOnce,
    handleShare,
    isPublic,
    from,
    updatedAt
}: any) {
    const [lastSaved, setLastSaved] = useState(updatedAt);
    const router = useRouter();

    function onSave() {
        handleSave();
        setLastSaved(new Date().toISOString());
    }

    function onInputBlur() {
        handleTitleBlur();
        setLastSaved(new Date().toISOString());
    }



    const dateAndTime = formatTimeDate(lastSaved);

    return (
        <div
            className="absolute h-11 bottom-4 left-1/2 -translate-x-1/2 Island App-toolbar z-50 flex items-center gap-1.5 bg-white p-1 rounded-[.5rem] border border-[#e9ecef] pointer-events-auto"
            style={{ boxShadow: "0px 0px .931014px 0px #0000002b, 0px 0px 3.12708px 0px #00000014, 0px 7px 14px 0px #0000000d" }}
        >
            {/* Back button */}
            <button
                onClick={() => router.push(`/dashboard?tab=${from}`)}
                title="Back to dashboard"
                className="p-1.5 text-[#868e96] hover:text-[#1e1e1e] hover:bg-[#f8f9fa] rounded-lg transition-colors"
                aria-label="Back to dashboard"
            >
                <ArrowLeft className="w-5 h-5" />
            </button>

            <div className="w-px h-5 bg-[#e9ecef] mx-1" />

            {/* Title */}
            <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onBlur={onInputBlur}
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

            {/* Save button */}
            <button
                onClick={onSave}
                disabled={isSaving}
                title={isGuest ? "Save to browser" : "Save (Ctrl+S)"}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold text-[#6965db] hover:bg-[#f3f0ff] rounded-lg transition-colors disabled:opacity-40"
                style={{ fontFamily: "'Virgil', cursive" }}
            >
                {isSaving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                ) : saveSuccess ? (
                    <Check className="w-4 h-4 text-[#2f9e44]" />
                ) : (
                    <Save className="w-4 h-4" />
                )}
                {saveSuccess ? "Saved!" : "Save"}
            </button>

            <div
                className="ml-2 px-2 py-0.5 text-xs flex items-center gap-1 bg-purple-200 border   rounded-full whitespace-nowrap font-medium"
                style={{ fontFamily: "'Virgil', cursive" }}
            >
                <History size={16} /> {dateAndTime}
            </div>

            {/* Guest indicator */}
            {isGuest && (
                <span
                    className="ml-2 px-2 py-0.5 text-xs bg-[#fff9db] border border-[#f59f00] text-[#e67700] rounded-full whitespace-nowrap font-medium"
                    style={{ fontFamily: "'Virgil', cursive" }}
                >
                    {guestSavedOnce
                        ? "Guest · saved locally"
                        : "Guest · changes not cloud saved"}
                </span>
            )}

            {/* Share button */}
            <button
                onClick={handleShare}
                title={isPublic ? "Make private" : "Share publicly"}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold rounded-lg transition-colors ${isPublic ? "text-[#2f9e44] hover:bg-[#ebfbee]" : "text-[#868e96] bg-sky-50 hover:bg-[#f8f9fa]"
                    }`}
            >
                {isPublic ? <Globe className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
            </button>
        </div>
    );
}