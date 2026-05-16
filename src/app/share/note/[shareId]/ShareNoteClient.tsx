"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { nanoid } from "nanoid";
import { Cloud, Save, Loader2, Home } from "lucide-react";
import MarkdownEditorLayout from "@/components/MarkdownEditorLayout";
import { saveGuestNote } from "@/lib/guestStorage";

import { migrateLocalNote } from "@/actions/noteActions";

interface ShareNoteClientProps {
  note: any;
  isLoggedIn: boolean;
}

export default function ShareNoteClient({ note, isLoggedIn }: ShareNoteClientProps) {
  const router = useRouter();
  const [title, setTitle] = useState(note.title || "Untitled Note");
  const [content, setContent] = useState(note.content || "");
  const [isSaving, setIsSaving] = useState(false);

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
          {isLoggedIn && (
            <button
              onClick={handleSaveToCloud}
              disabled={isSaving}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-[#f3f0ff] text-[#6965db] hover:bg-[#e5e0ff] rounded-lg transition-colors disabled:opacity-60"
            >
              {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Cloud className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">Save to Cloud</span>
            </button>
          )}

          <button
            onClick={handleSaveToLocal}
            disabled={isSaving}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors disabled:opacity-60 ${
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
