"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { nanoid } from "nanoid";
import { Cloud, Save, Loader2, Home, Bookmark } from "lucide-react";
import MarkdownEditorLayout from "@/components/MarkdownEditorLayout";
import { saveGuestNote } from "@/lib/guestStorage";
import { toggleSavedPublicLink } from "@/actions/shareActions";

import { migrateLocalNote } from "@/actions/noteActions";

interface ShareNoteClientProps {
  note: any;
  clerkUserId?: string;
}

export default function ShareNoteClient({ note, clerkUserId }: ShareNoteClientProps) {
  const router = useRouter();
  const [title, setTitle] = useState(note.title || "Untitled Note");
  const [content, setContent] = useState(note.content || "");
  const [isSaving, setIsSaving] = useState(false);
  const [savedByList, setSavedByList] = useState<string[]>(note.savedBy || []);

  const isLoggedIn = !!clerkUserId;
  const isSaved = clerkUserId ? savedByList.includes(clerkUserId) : false;

  const handleToggleSaveLink = async () => {
    if (!clerkUserId) return;
    setIsSaving(true);
    try {
      const res = await toggleSavedPublicLink(note._id, "note");
      if (res.saved) {
        setSavedByList([...savedByList, clerkUserId]);
        toast.success("Note link saved to dashboard!");
      } else {
        setSavedByList(savedByList.filter(uid => uid !== clerkUserId));
        toast.success("Note link removed from dashboard!");
      }
    } catch (error) {
      toast.error("Failed to update saved public link");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveToCloud = async () => {
    setIsSaving(true);
    try {
      await migrateLocalNote({ title, content });
      toast.success("Saved to Cloud!");
      router.push("/dashboard?tab=notes");
    } catch (error) {
      toast.error("Failed to save to cloud");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveToLocal = async () => {
    setIsSaving(true);
    try {
      const newId = nanoid();
      await saveGuestNote({
        id: newId,
        title,
        content,
      });
      toast.success("Saved to Local Storage!");
      router.push("/dashboard?tab=notes");
    } catch (error) {
      toast.error("Failed to save locally");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <MarkdownEditorLayout
      title={title}
      setTitle={setTitle}
      content={content}
      setContent={setContent}
      backButtonSlot={
        <button
          onClick={() => router.push("/")}
          title="Go to Home"
          className="flex items-center gap-1.5 text-[#868e96] hover:text-[#6965db] transition-colors font-semibold"
        >
          <Home className="w-4 h-4" />
          <span className="text-xs leading-0">Home</span>
        </button>
      }
      actionButtonsSlot={
        <>
          {clerkUserId && (
            <button
              onClick={handleToggleSaveLink}
              disabled={isSaving}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors border-2 disabled:opacity-60 ${
                isSaved
                  ? "border-[#6965db] text-[#6965db] bg-[#f3f0ff]"
                  : "border-[#e9ecef] text-[#868e96] hover:border-[#6965db] hover:text-[#6965db]"
              }`}
            >
              {isSaving ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Bookmark className={`w-3.5 h-3.5 ${isSaved ? "fill-[#6965db]" : ""}`} />
              )}
              <span className="hidden sm:inline">
                {isSaved ? "Saved to Dashboard" : "Save Link"}
              </span>
            </button>
          )}

          {isLoggedIn && (
            <button
              onClick={handleSaveToCloud}
              disabled={isSaving}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-[#f3f0ff] text-[#6965db] hover:bg-[#e5e0ff] rounded-lg transition-colors disabled:opacity-60 border-2 border-transparent"
            >
              {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Cloud className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">Save to Cloud</span>
            </button>
          )}

          <button
            onClick={handleSaveToLocal}
            disabled={isSaving}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors disabled:opacity-60 border-2 border-transparent ${
              isLoggedIn ? "bg-[#fff9db] text-[#e67700] hover:bg-[#ffec99]" : "bg-[#f3f0ff] text-[#6965db] hover:bg-[#e5e0ff]"
            }`}
          >
            {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">Save to Local</span>
          </button>
        </>
      }
    />
  );
}
