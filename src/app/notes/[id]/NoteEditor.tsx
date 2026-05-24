"use client";

import { useState, useEffect, useRef, useCallback, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Save, Trash2, Globe, Lock, ArrowLeft, Loader2, CheckCircle2, Users
} from "lucide-react";
import { updateNote, deleteNote, toggleNotePublic } from "@/actions/noteActions";
import { saveGuestNote, deleteGuestNote, loadGuestNote } from "@/lib/guestStorage";
import MarkdownEditorLayout from "@/components/MarkdownEditorLayout";
import ShareDialog from "@/components/ShareDialog";

interface Note {
  _id?: string;
  key?: string;
  title: string;
  content: string;
  visibility?: "private" | "public" | "restricted";
  invitedEmails?: string[];
  folderId?: string;
  isPublic?: boolean;
  shareId?: string;
  updatedAt?: string;
}

interface NoteEditorProps {
  initialNote: Note;
  isGuest?: boolean;
  autoOpenShare?: boolean;
}

type SaveStatus = "idle" | "saving" | "saved";

const AUTOSAVE_DELAY = 1500;

export default function NoteEditor({ initialNote, isGuest = false, autoOpenShare = false }: NoteEditorProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Content state
  const [title, setTitleState] = useState(initialNote.title);
  const [content, setContentState] = useState(initialNote.content);
  const [isPublic, setIsPublic] = useState(initialNote.isPublic ?? false);
  const [visibility, setVisibility] = useState<"private" | "public" | "restricted">(
    initialNote.visibility || (initialNote.isPublic ? "public" : "private")
  );
  const [invitedEmails, setInvitedEmails] = useState<string[]>(initialNote.invitedEmails || []);
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(autoOpenShare);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(
    initialNote.updatedAt ? new Date(initialNote.updatedAt) : null
  );
  const lastSavedTitle = useRef(initialNote.title);

  const [isHydrated, setIsHydrated] = useState(!isGuest);
  const isDirty = useRef(false);

  const setTitle = useCallback((t: string) => {
    setTitleState(t);
    if (isHydrated) {
      isDirty.current = true;
    }
  }, [isHydrated]);

  const setContent = useCallback((c: string) => {
    setContentState(c);
    if (isHydrated) {
      isDirty.current = true;
    }
  }, [isHydrated]);

  const noteId = initialNote._id ?? initialNote.key ?? "";

  // Hydrate guest note from IndexedDB on first mount
  useEffect(() => {
    if (!isGuest) return;
    loadGuestNote(noteId).then((record) => {
      if (record) {
        setTitleState(record.title);
        setContentState(record.content);
        lastSavedTitle.current = record.title;
      }
      setIsHydrated(true);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-save debounce
  const autosaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Clean up autosave timer on unmount
  useEffect(() => {
    return () => {
      if (autosaveTimer.current) {
        clearTimeout(autosaveTimer.current);
      }
    };
  }, []);

  // --- Save helpers ---
  const saveToCloud = useCallback(
    async (t: string, c: string) => {
      await updateNote(noteId, { title: t, content: c });
    },
    [noteId]
  );

  const saveToLocal = useCallback(
    async (t: string, c: string) => {
      await saveGuestNote({ id: noteId, title: t, content: c });
    },
    [noteId]
  );

  const triggerSave = useCallback(
    (t: string, c: string, changed_key?: string) => {
      if (changed_key === "title") {
        if (t === lastSavedTitle.current) {
          return;
        }
      }
      if (autosaveTimer.current) clearTimeout(autosaveTimer.current);
      setSaveStatus("saving");
      autosaveTimer.current = setTimeout(async () => {
        try {
          if (isGuest) {
            await saveToLocal(t, c);
          } else {
            await saveToCloud(t, c);
          }
          lastSavedTitle.current = t;
          setLastSavedAt(new Date());
          setSaveStatus("saved");
          isDirty.current = false;
          setTimeout(() => setSaveStatus("idle"), 2000);
        } catch {
          setSaveStatus("idle");
          toast.error("Auto-save failed");
        }
      }, AUTOSAVE_DELAY);
    },
    [isGuest, saveToCloud, saveToLocal]
  );

  // Manual save
  const handleSave = () => {
    if (autosaveTimer.current) clearTimeout(autosaveTimer.current);
    startTransition(async () => {
      try {
        if (isGuest) {
          await saveToLocal(title, content);
        } else {
          await saveToCloud(title, content);
        }
        setLastSavedAt(new Date());
        setSaveStatus("saved");
        isDirty.current = false;
        toast.success("Note saved");
        setTimeout(() => setSaveStatus("idle"), 2000);
      } catch {
        toast.error("Save failed");
      }
    });
  };

  // Exit & Save
  const handleExit = async () => {
    if (autosaveTimer.current) clearTimeout(autosaveTimer.current);
    if (!isHydrated || !isDirty.current) {
      router.push("/dashboard?tab=notes");
      return;
    }
    try {
      if (isGuest) {
        await saveToLocal(title, content);
      } else {
        await saveToCloud(title, content);
      }
    } catch (e) {
      console.error("Failed to save on exit", e);
    }
    router.push("/dashboard?tab=notes");
  };

  // Delete
  const handleDelete = () => {
    const confirmed = window.confirm("Delete this note? This cannot be undone.");
    if (!confirmed) return;
    startTransition(async () => {
      try {
        if (isGuest) {
          await deleteGuestNote(noteId);
        } else {
          await deleteNote(noteId);
        }
        toast.success("Note deleted");
        router.push("/dashboard");
      } catch {
        toast.error("Failed to delete note");
      }
    });
  };



  const formatSavedAt = (date: Date) => {
    const now = new Date();
    const isToday =
      date.getFullYear() === now.getFullYear() &&
      date.getMonth() === now.getMonth() &&
      date.getDate() === now.getDate();
    const time = date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
    if (isToday) return `Saved at ${time}`;
    return `Saved ${date.toLocaleDateString("en-US", { month: "short", day: "numeric" })} at ${time}`;
  };

  const SaveIndicator = () => {
    if (saveStatus === "saving")
      return (
        <span className="flex items-center gap-1 text-xs text-[#adb5bd]">
          <Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving…
        </span>
      );
    if (saveStatus === "saved")
      return (
        <span className="flex items-center gap-1 text-xs text-emerald-500">
          <CheckCircle2 className="w-3.5 h-3.5" /> Saved
        </span>
      );
    if (lastSavedAt)
      return (
        <span className="flex items-center gap-1 text-xs text-[#adb5bd]">
          <CheckCircle2 className="w-3 h-3" />
          {formatSavedAt(lastSavedAt)}
        </span>
      );
    return null;
  };

  return (
    <>
      <MarkdownEditorLayout
      title={title}
      setTitle={setTitle}
      content={content}
      setContent={setContent}
      onTitleBlur={() => triggerSave(title, content, "title")}
      backButtonSlot={
        <button
          onClick={handleExit}
          className="flex items-center gap-1.5 text-[#868e96] hover:text-[#6965db] transition-colors font-semibold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-xs leading-0">Dashboard</span>
        </button>
      }
      saveIndicatorSlot={<SaveIndicator />}
      actionButtonsSlot={
        <>
          {!isGuest && (
            <button
              onClick={() => setIsShareDialogOpen(true)}
              disabled={isPending}
              title="Open sharing settings"
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors border-2 ${
                visibility === "public"
                  ? "border-[#6965db] text-[#6965db] bg-[#f3f0ff]"
                  : visibility === "restricted"
                  ? "border-[#d97706] text-[#d97706] bg-[#fffbeb]"
                  : "border-[#e9ecef] text-[#868e96] hover:border-[#6965db] hover:text-[#6965db]"
              }`}
            >
              {visibility === "public" ? (
                <Globe className="w-3.5 h-3.5" />
              ) : visibility === "restricted" ? (
                <Users className="w-3.5 h-3.5" />
              ) : (
                <Lock className="w-3.5 h-3.5" />
              )}
              <span className="hidden sm:inline">
                {visibility === "public"
                  ? "Public"
                  : visibility === "restricted"
                  ? "Restricted"
                  : "Private"}
              </span>
            </button>
          )}

          <button
            onClick={handleSave}
            disabled={isPending}
            id="note-save-btn"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-[#6965db] text-white rounded-lg hover:bg-[#5854c4] transition-colors disabled:opacity-60"
          >
            {isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">Save</span>
          </button>

          <button
            onClick={handleDelete}
            disabled={isPending}
            title="Delete note"
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-[#868e96] hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors border-2 border-transparent hover:border-red-200"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </>
      }
    />

    {/* Share Dialog */}
    {isShareDialogOpen && (
      <ShareDialog
        isOpen={true}
        onClose={() => setIsShareDialogOpen(false)}
        entityId={noteId}
        entityType="note"
        initialVisibility={visibility}
        initialInvitedEmails={invitedEmails}
        shareId={initialNote.shareId}
        folderId={initialNote.folderId}
        onUpdate={(newVisibility, newEmails) => {
          setVisibility(newVisibility);
          setInvitedEmails(newEmails);
        }}
      />
    )}
    </>
  );
}
