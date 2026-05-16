"use client";

import { useState, useEffect, useRef, useCallback, useTransition } from "react";
import { useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";
import { toast } from "sonner";
import {
  Save, Trash2, Globe, Lock, ArrowLeft, Edit3, Eye,
  GripVertical, Loader2, CheckCircle2
} from "lucide-react";
import { updateNote, deleteNote, toggleNotePublic } from "@/actions/noteActions";
import { saveGuestNote, deleteGuestNote, loadGuestNote } from "@/lib/guestStorage";

interface Note {
  _id?: string;
  key?: string;
  title: string;
  content: string;
  isPublic?: boolean;
  shareId?: string;
  updatedAt?: string;
}

interface NoteEditorProps {
  initialNote: Note;
  isGuest?: boolean;
}

type SaveStatus = "idle" | "saving" | "saved";
type MobileTab = "edit" | "preview";

const AUTOSAVE_DELAY = 1500;

export default function NoteEditor({ initialNote, isGuest = false }: NoteEditorProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Content state
  const [title, setTitle] = useState(initialNote.title);
  const [content, setContent] = useState(initialNote.content);
  const [isPublic, setIsPublic] = useState(initialNote.isPublic ?? false);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [mobileTab, setMobileTab] = useState<MobileTab>("edit");
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(
    initialNote.updatedAt ? new Date(initialNote.updatedAt) : null
  );

  // Hydrate guest note from IndexedDB on first mount
  useEffect(() => {
    if (!isGuest) return;
    loadGuestNote(noteId).then((record) => {
      if (record) {
        setTitle(record.title);
        setContent(record.content);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Resizable split pane
  const [splitPct, setSplitPct] = useState(50); // left pane width %
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const dragStartX = useRef(0);
  const dragStartPct = useRef(50);

  // Auto-save debounce
  const autosaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const noteId = initialNote._id ?? initialNote.key ?? "";

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
    (t: string, c: string) => {
      if (autosaveTimer.current) clearTimeout(autosaveTimer.current);
      setSaveStatus("saving");
      autosaveTimer.current = setTimeout(async () => {
        try {
          if (isGuest) {
            await saveToLocal(t, c);
          } else {
            await saveToCloud(t, c);
          }
          setLastSavedAt(new Date());
          setSaveStatus("saved");
          setTimeout(() => setSaveStatus("idle"), 2000);
        } catch {
          setSaveStatus("idle");
          toast.error("Auto-save failed");
        }
      }, AUTOSAVE_DELAY);
    },
    [isGuest, saveToCloud, saveToLocal]
  );

  // Auto-save on open
  useEffect(() => {
    triggerSave(title, content);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  // Share toggle
  const handleTogglePublic = () => {
    if (isGuest) return;
    startTransition(async () => {
      try {
        const next = !isPublic;
        await toggleNotePublic(noteId, next);
        setIsPublic(next);
        if (next && initialNote.shareId) {
          const shareUrl = `${window.location.origin}/share/note/${initialNote.shareId}`;
          await navigator.clipboard.writeText(shareUrl);
          toast.success("Link copied to clipboard!");
        } else {
          toast.success("Note set to private");
        }
      } catch {
        toast.error("Failed to update sharing");
      }
    });
  };

  // --- Resizable drag handle ---
  const onMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true;
    dragStartX.current = e.clientX;
    dragStartPct.current = splitPct;
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
  };

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging.current || !containerRef.current) return;
      const containerWidth = containerRef.current.getBoundingClientRect().width;
      const delta = e.clientX - dragStartX.current;
      const deltaPct = (delta / containerWidth) * 100;
      const newPct = Math.min(80, Math.max(20, dragStartPct.current + deltaPct));
      setSplitPct(newPct);
    };

    const onMouseUp = () => {
      isDragging.current = false;
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, []);

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
    <div className="flex flex-col h-[calc(100vh-var(--navbar-height,56px))] bg-white">
      {/* ── Toolbar ── */}
      <header className="flex items-center gap-3 px-4 py-2.5 border-b-2 border-[#e9ecef] bg-white shrink-0">
        {/* Back */}
        <button
          onClick={handleExit}
          className="flex items-center gap-1.5 text-[#868e96] hover:text-[#6965db] transition-colors font-semibold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-xs leading-0">Dashboard</span>
        </button>

        <div className="w-px h-5 bg-[#e9ecef]" />

        {/* Title (inline editable) */}
        <input
          id="note-title-input"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={() => triggerSave(title, content)}
          className="flex-1 font-bold text-[#1e1e1e] text-base bg-transparent outline-none placeholder:text-[#adb5bd] min-w-0"
          style={{ fontFamily: "'Virgil', cursive" }}
          placeholder="Untitled Note"
          maxLength={120}
        />

        <SaveIndicator />

        {/* Mobile tab toggle */}
        <div className="flex md:hidden border-2 border-[#e9ecef] rounded-lg overflow-hidden text-xs font-semibold">
          <button
            onClick={() => setMobileTab("edit")}
            className={`px-3 py-1.5 flex items-center gap-1 transition-colors ${mobileTab === "edit" ? "bg-[#6965db] text-white" : "text-[#495057] hover:bg-[#f3f0ff]"}`}
          >
            <Edit3 className="w-3 h-3" /> Edit
          </button>
          <button
            onClick={() => setMobileTab("preview")}
            className={`px-3 py-1.5 flex items-center gap-1 transition-colors ${mobileTab === "preview" ? "bg-[#6965db] text-white" : "text-[#495057] hover:bg-[#f3f0ff]"}`}
          >
            <Eye className="w-3 h-3" /> Preview
          </button>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-1 shrink-0">
          {/* Share (cloud only) */}
          {!isGuest && (
            <button
              onClick={handleTogglePublic}
              disabled={isPending}
              title={isPublic ? "Make private" : "Share publicly"}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors border-2 ${isPublic ? "border-[#6965db] text-[#6965db] bg-[#f3f0ff]" : "border-[#e9ecef] text-[#868e96] hover:border-[#6965db] hover:text-[#6965db]"}`}
            >
              {isPublic ? <Globe className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{isPublic ? "Public" : "Private"}</span>
            </button>
          )}

          {/* Save */}
          <button
            onClick={handleSave}
            disabled={isPending}
            id="note-save-btn"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-[#6965db] text-white rounded-lg hover:bg-[#5854c4] transition-colors disabled:opacity-60"
          >
            {isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">Save</span>
          </button>

          {/* Delete */}
          <button
            onClick={handleDelete}
            disabled={isPending}
            title="Delete note"
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-[#868e96] hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors border-2 border-transparent hover:border-red-200"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* ── Editor area ── */}
      {/* Desktop: resizable split pane */}
      <div
        ref={containerRef}
        className="hidden md:flex flex-1 overflow-hidden"
      >
        {/* Left pane — editor */}
        <div
          className="flex flex-col overflow-hidden border-r-0"
          style={{ width: `${splitPct}%` }}
        >
          <div className="px-4 py-1.5 border-b border-[#f1f3f5] bg-[#f8f9fa]">
            <span className="text-[10px] font-semibold text-[#adb5bd] uppercase tracking-widest flex items-center gap-1">
              <Edit3 className="w-3 h-3" /> Markdown
            </span>
          </div>
          <textarea
            id="note-content-textarea"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={"# My Note\n\nStart writing in **Markdown**...\n\n- List item\n- Another item\n\n```code block```"}
            className="flex-1 resize-none outline-none p-5 font-mono text-sm text-[#212529] leading-relaxed bg-white placeholder:text-[#ced4da]"
            spellCheck={false}
          />
        </div>

        {/* Drag handle */}
        <div
          onMouseDown={onMouseDown}
          className="relative flex items-center justify-center w-2 bg-[#f1f3f5] hover:bg-[#d0c8f8] cursor-col-resize group shrink-0 transition-colors"
          title="Drag to resize"
        >
          <GripVertical className="w-3 h-3 text-[#adb5bd] group-hover:text-[#6965db] transition-colors" />
        </div>

        {/* Right pane — preview */}
        <div
          className="flex flex-col overflow-hidden"
          style={{ width: `${100 - splitPct}%` }}
        >
          <div className="px-4 py-1.5 border-b border-[#f1f3f5] bg-[#f8f9fa]">
            <span className="text-[10px] font-semibold text-[#adb5bd] uppercase tracking-widest flex items-center gap-1">
              <Eye className="w-3 h-3" /> Preview
            </span>
          </div>
          <div className="flex-1 overflow-y-auto p-5">
            {content ? (
              <div className="markdown-preview">
                <ReactMarkdown>{content}</ReactMarkdown>
              </div>
            ) : (
              <p className="text-sm text-[#ced4da] italic">Preview will appear here…</p>
            )}
          </div>
        </div>
      </div>

      {/* Mobile: single pane with tab toggle */}
      <div className="flex md:hidden flex-1 overflow-hidden flex-col">
        {mobileTab === "edit" ? (
          <textarea
            id="note-content-textarea-mobile"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={"# My Note\n\nStart writing in **Markdown**..."}
            className="flex-1 resize-none outline-none p-5 font-mono text-sm text-[#212529] leading-relaxed bg-white placeholder:text-[#ced4da]"
            spellCheck={false}
          />
        ) : (
          <div className="flex-1 overflow-y-auto p-5">
            {content ? (
              <div className="markdown-preview">
                <ReactMarkdown>{content}</ReactMarkdown>
              </div>
            ) : (
              <p className="text-sm text-[#ced4da] italic">Preview will appear here…</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
