"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getProfileByUsername } from "@/actions/noteActions";
import { toast } from "sonner";
import { Search, Loader2, AlertCircle, Compass } from "lucide-react";

export default function ExploreClient() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return; // Must be the first line as required!

    setIsLoading(false); // Reset just in case
    setIsLoading(true);
    try {
      const trimmedQuery = query.trim().replace(/^@/, ""); // support query with or without leading @
      const profile = await getProfileByUsername(trimmedQuery);
      if (profile && profile.username) {
        toast.success(`User found! Redirecting to @${profile.username}...`);
        router.push(`/${profile.username}`);
      } else {
        toast.error(`User "${trimmedQuery}" not found`);
      }
    } catch (err) {
      toast.error("Failed to fetch user. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4 bg-[#f8f9fa] min-h-[calc(100vh-56px)]">
      <div
        className="w-full max-w-lg bg-white border-2 border-[#1e1e1e] p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col gap-6"
        style={{
          borderRadius: "12px 4px 14px 5px / 5px 14px 4px 12px",
          fontFamily: "'Virgil', 'Comic Sans MS', cursive",
        }}
      >
        {/* Header */}
        <div className="flex flex-col items-center text-center gap-2">
          <div className="p-3 bg-[#e5e0ff] rounded-full border-2 border-[#1e1e1e] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            <Compass className="w-8 h-8 text-[#6965db]" />
          </div>
          <h1 className="text-3xl font-extrabold text-[#1e1e1e] tracking-tight mt-2">
            Explore Creators
          </h1>
          <p className="text-sm text-[#495057] max-w-sm mt-1">
            Search for authors to explore their public whiteboards, canvas drawings, and shared notes.
          </p>
        </div>

        {/* Search Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="username-search-input"
              className="text-sm font-bold text-[#1e1e1e]"
            >
              Creator Username
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-lg text-[#adb5bd] font-bold">
                @
              </span>
              <input
                id="username-search-input"
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="username"
                disabled={isLoading}
                className="w-full pl-8 pr-12 py-3.5 text-lg border-2 border-[#1e1e1e] focus:outline-none focus:ring-3 focus:ring-[#6965db]/20 focus:border-[#6965db] transition-all bg-white text-[#1e1e1e]"
                style={{
                  borderRadius: "8px 6px 9px 5px / 6px 9px 5px 8px",
                }}
              />
              <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
                <Search className="w-5 h-5 text-[#868e96]" />
              </div>
            </div>
          </div>

          <button
            id="username-search-submit"
            type="submit"
            disabled={isLoading || !query.trim()}
            className="w-full bg-[#6965db] text-white hover:bg-[#5854c4] border-2 border-[#1e1e1e] font-bold text-lg py-3.5 transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-[2px] active:translate-y-[2px] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            style={{
              borderRadius: "8px 2px 7px 3px / 3px 7px 2px 8px",
            }}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Searching...
              </>
            ) : (
              <>
                <Search className="w-5 h-5" />
                Search Profile
              </>
            )}
          </button>
        </form>

        {/* Informative Warning Note */}
        <div
          className="border-2 border-dashed border-[#ff922b] bg-[#fff4e6] text-[#d9480f] p-4 flex gap-3 items-start"
          style={{
            borderRadius: "6px 10px 5px 8px / 9px 5px 10px 6px",
          }}
        >
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div className="flex flex-col gap-0.5">
            <span className="font-bold text-sm">Clerk Username Required</span>
            <p className="text-xs text-[#e67700] leading-relaxed">
              Only creators who have configured a <strong>username</strong> in their Clerk profile can be discovered and have public pages.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
