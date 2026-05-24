import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, AlertCircle } from "lucide-react";
import { getProfileByUsername, getPublicNotesByUserId } from "@/actions/noteActions";
import ProfileClient from "./ProfileClient";

interface ProfilePageProps {
  params: Promise<{
    username: string;
  }>;
}

export async function generateMetadata({ params }: ProfilePageProps): Promise<Metadata> {
  const { username } = await params;
  const decodedUsername = decodeURIComponent(username).replace(/^@/, "");
  return {
    title: `@${decodedUsername} on Excali-Draw — Creator Profile`,
    description: `Explore the public whiteboards, canvas drawings, and shared notes created by @${decodedUsername} on Excali-Draw.`,
  };
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { username } = await params;
  const decodedUsername = decodeURIComponent(username).replace(/^@/, "");

  const profile = await getProfileByUsername(decodedUsername);

  if (!profile) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 bg-[#f8f9fa] min-h-[calc(100vh-56px)]">
        <div
          className="w-full max-w-md bg-white border-2 border-[#1e1e1e] p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col items-center text-center gap-6"
          style={{
            borderRadius: "12px 6px 14px 4px / 4px 14px 6px 12px",
            fontFamily: "'Virgil', 'Comic Sans MS', cursive",
          }}
        >
          <div className="p-4 bg-[#fff0f6] text-[#e03131] rounded-full border-2 border-[#1e1e1e] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            <AlertCircle className="w-12 h-12" />
          </div>

          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-extrabold text-[#1e1e1e] tracking-tight">
              Creator Not Found
            </h1>
            <p className="text-sm text-[#495057] leading-relaxed mt-2">
              The user <strong className="text-[#6965db]">@{decodedUsername}</strong> does not exist or has not configured a username in their Clerk profile.
            </p>
          </div>

          <div className="border-t border-gray-100 pt-6 w-full flex flex-col gap-4">
            <p className="text-xs text-[#868e96] leading-relaxed">
              Only discoverable creators with configured usernames can be accessed publicly. Make sure the username is spelled correctly.
            </p>
            <Link
              href="/explore"
              className="w-full bg-[#6965db] text-white hover:bg-[#5854c4] border-2 border-[#1e1e1e] font-bold text-base py-3 transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-[2px] active:translate-y-[2px] flex items-center justify-center gap-2"
              style={{
                borderRadius: "8px 2px 7px 3px / 3px 7px 2px 8px",
              }}
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Explore
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const notes = await getPublicNotesByUserId(profile.id);

  return <ProfileClient profile={profile} notes={notes} />;
}
