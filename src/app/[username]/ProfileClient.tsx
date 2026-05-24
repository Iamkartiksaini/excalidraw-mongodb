"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { toast } from "sonner";
import { nanoid } from "nanoid";
import Link from "next/link";
import {
  BookOpen,
  Cloud,
  Download,
  Loader2,
  Calendar,
  Compass,
  FileText,
  User,
  ArrowLeft,
} from "lucide-react";
import { saveGuestNote } from "@/lib/guestStorage";
import { clonePublicNoteToCloud, getPublicNote } from "@/actions/noteActions";

interface NoteItem {
  _id: string;
  title: string;
  content: string; // This is the truncated preview content
  updatedAt: string;
  shareId: string;
  visibility: string;
}

interface ProfileClientProps {
  profile: {
    id: string;
    username: string;
    imageUrl: string;
  };
  notes: NoteItem[];
}

export default function ProfileClient({ profile, notes }: ProfileClientProps) {
  const router = useRouter();
  const { userId, isLoaded } = useAuth();
  const [cloningCloudId, setCloningCloudId] = useState<string | null>(null);
  const [cloningLocalId, setCloningLocalId] = useState<string | null>(null);

  const isLoggedIn = !!userId;

  const handleCloneToCloud = async (noteId: string) => {
    if (!isLoggedIn) {
      toast.error("Please sign in to clone notes to your cloud database!");
      return;
    }

    setCloningCloudId(noteId);
    try {
      const res = await clonePublicNoteToCloud(noteId);
      if (res && res._id) {
        toast.success(`"${res.title || "Note"}" successfully cloned to your Cloud dashboard!`);
        router.push("/dashboard?tab=notes");
      } else {
        toast.error("Failed to clone note to cloud");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to clone note to cloud");
    } finally {
      setCloningCloudId(null);
    }
  };

  const handleCloneToLocal = async (note: NoteItem) => {
    setCloningLocalId(note._id);
    try {
      // Fetch the full content of the public note using the shareId
      const fullNote = await getPublicNote(note.shareId);
      const newId = nanoid();
      await saveGuestNote({
        id: newId,
        title: `${fullNote.title || "Untitled"} (Clone)`,
        content: fullNote.content || "",
      });
      toast.success(`"${fullNote.title || "Note"}" cloned to local browser storage!`);
      router.push("/dashboard?tab=notes");
    } catch (err: any) {
      toast.error("Failed to clone note locally.");
    } finally {
      setCloningLocalId(null);
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch (e) {
      return dateStr;
    }
  };

  return (
    <div className="flex-1 bg-[#f8f9fa] min-h-[calc(100vh-56px)] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto flex flex-col gap-8">
        
        {/* Back Link */}
        <Link
          href="/explore"
          className="self-start flex items-center gap-2 text-[#495057] hover:text-[#6965db] transition-colors font-bold text-sm"
          style={{ fontFamily: "'Virgil', cursive" }}
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Explore
        </Link>

        {/* Profile Card Header */}
        <div
          className="w-full bg-white border-2 border-[#1e1e1e] p-6 sm:p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col sm:flex-row items-center sm:items-start gap-6"
          style={{
            borderRadius: "12px 6px 14px 4px / 4px 14px 6px 12px",
            fontFamily: "'Virgil', 'Comic Sans MS', cursive",
          }}
        >
          {/* Avatar */}
          <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden border-4 border-[#1e1e1e] bg-sky-100 flex-shrink-0 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.15)]">
            {profile.imageUrl ? (
              <img
                src={profile.imageUrl}
                alt={`${profile.username}'s avatar`}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-[#e5e0ff]">
                <User className="w-12 h-12 text-[#6965db]" />
              </div>
            )}
          </div>

          {/* Details */}
          <div className="flex-1 flex flex-col items-center sm:items-start gap-2 text-center sm:text-left mt-2">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#1e1e1e] tracking-tight">
              @{profile.username}
            </h1>
            <p className="text-sm font-semibold text-[#868e96] bg-[#f1f3f5] px-3 py-1 border border-gray-200"
               style={{ borderRadius: "6px 3px 6px 4px" }}
            >
              Public Creator
            </p>
            <div className="mt-4 flex gap-6 text-sm text-[#495057] font-bold">
              <div className="flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-[#6965db]" />
                <span>{notes.length} Public {notes.length === 1 ? "Note" : "Notes"}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Public Notes Section */}
        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-2 border-b-2 border-dashed border-[#dee2e6] pb-3">
            <Compass className="w-6 h-6 text-[#6965db]" />
            <h2 className="text-2xl font-bold text-[#1e1e1e]"
                style={{ fontFamily: "'Virgil', cursive" }}
            >
              Public Notes
            </h2>
          </div>

          {notes.length === 0 ? (
            <div
              className="bg-white border-2 border-[#1e1e1e] p-12 text-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-col items-center gap-4"
              style={{
                borderRadius: "8px 12px 6px 10px / 10px 6px 12px 8px",
                fontFamily: "'Virgil', cursive",
              }}
            >
              <FileText className="w-12 h-12 text-[#adb5bd] stroke-1" />
              <div>
                <p className="text-xl font-bold text-[#495057]">No public notes yet</p>
                <p className="text-sm text-[#868e96] mt-1">This creator hasn't published any notes to their public profile.</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {notes.map((note) => (
                <div
                  key={note._id}
                  className="bg-white border-2 border-[#1e1e1e] p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all hover:-translate-x-[2px] hover:-translate-y-[2px] flex flex-col gap-4 justify-between h-64"
                  style={{
                    borderRadius: "8px 4px 7px 3px / 4px 7px 3px 8px",
                    fontFamily: "'Virgil', cursive",
                  }}
                >
                  {/* Note Header & Info */}
                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-start gap-2">
                      <h3 className="text-xl font-extrabold text-[#1e1e1e] truncate line-clamp-1">
                        {note.title || "Untitled Note"}
                      </h3>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-[#868e96] font-semibold">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{formatDate(note.updatedAt)}</span>
                    </div>
                    <p className="text-sm text-[#495057] line-clamp-3 leading-relaxed mt-1 whitespace-pre-wrap font-sans">
                      {note.content || "Empty content preview"}
                    </p>
                  </div>

                  {/* Note Action Buttons */}
                  <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-gray-100">
                    <Link
                      href={`/share/note/${note.shareId}`}
                      className="flex items-center justify-center gap-1.5 border-2 border-[#1e1e1e] text-[#1e1e1e] hover:bg-[#f3f0ff] hover:text-[#6965db] py-2 px-1 text-xs font-bold transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-[1px] active:translate-y-[1px]"
                      style={{ borderRadius: "5px 3px 5px 3px / 3px 5px 3px 5px" }}
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>View</span>
                    </Link>

                    <button
                      onClick={() => handleCloneToCloud(note._id)}
                      disabled={cloningCloudId !== null}
                      className="flex items-center justify-center gap-1.5 border-2 border-[#1e1e1e] bg-[#f3f0ff] text-[#6965db] hover:bg-[#e5e0ff] py-2 px-1 text-xs font-bold transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-[1px] active:translate-y-[1px] disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{ borderRadius: "3px 5px 3px 5px / 5px 3px 5px 3px" }}
                      title={isLoggedIn ? "Clone to your Cloud notes" : "Sign in required to clone to Cloud"}
                    >
                      {cloningCloudId === note._id ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Cloud className="w-3.5 h-3.5" />
                      )}
                      <span>Cloud</span>
                    </button>

                    <button
                      onClick={() => handleCloneToLocal(note)}
                      disabled={cloningLocalId !== null}
                      className="flex items-center justify-center gap-1.5 border-2 border-[#1e1e1e] bg-[#fff9db] text-[#e67700] hover:bg-[#ffec99] py-2 px-1 text-xs font-bold transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-[1px] active:translate-y-[1px] disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{ borderRadius: "5px 3px 5px 3px / 3px 5px 3px 5px" }}
                      title="Clone to local browser storage"
                    >
                      {cloningLocalId === note._id ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Download className="w-3.5 h-3.5" />
                      )}
                      <span>Local</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
