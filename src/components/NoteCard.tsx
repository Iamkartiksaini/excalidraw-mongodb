"use client";

import { useState, useTransition, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FileText, Trash2, Globe, Lock, Loader2, Clock, Upload, Copy, MoreVertical, Edit2, Link } from "lucide-react";
import { toast } from "sonner";
import { deleteNote, toggleNotePublic, migrateLocalNote, updateNote } from "@/actions/noteActions";
import { deleteGuestNote, renameGuestNote, saveGuestNote } from "@/lib/guestStorage";
import formatTimeDate from "@/lib/time-date-formatter";
import { useUser } from "@clerk/nextjs";
import { nanoid } from "nanoid";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface NoteCardProps {
  note: {
    _id?: string;
    key?: string;
    title: string;
    content: string;
    isPublic?: boolean;
    shareId?: string;
    updatedAt?: string;
  };
  isGuest?: boolean;
  onDelete?: () => void;
  onMigrate?: () => void;
}

export default function NoteCard({ note, isGuest = false, onDelete, onMigrate }: NoteCardProps) {
  const router = useRouter();
  const { isSignedIn } = useUser();
  const [isPending, startTransition] = useTransition();
  const [showConfirm, setShowConfirm] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false);
  const [renameInputValue, setRenameInputValue] = useState(note.title);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    if (menuOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);

  const handleRename = (e: React.MouseEvent) => {
    e.stopPropagation();
    setMenuOpen(false);
    setRenameInputValue(note.title);
    setIsRenameDialogOpen(true);
  };

  const submitRename = (e: React.FormEvent) => {
    e.preventDefault();
    if (!renameInputValue || renameInputValue === note.title) {
      setIsRenameDialogOpen(false);
      return;
    }

    startTransition(async () => {
      try {
        if (isGuest) {
          await renameGuestNote(noteId, renameInputValue);
        } else {
          await updateNote(noteId, { title: renameInputValue });
        }
        toast.success("Note renamed");
        setIsRenameDialogOpen(false);
        onDelete?.(); // trigger refetch
      } catch {
        toast.error("Failed to rename note");
      }
    });
  };

  const handleCloneLocal = (e: React.MouseEvent) => {
    e.stopPropagation();
    setMenuOpen(false);
    startTransition(async () => {
      try {
        await saveGuestNote({
          id: nanoid(10),
          title: `${note.title || "Untitled"} (Copy)`,
          content: note.content,
        });
        toast.success("Note cloned locally!");
        if (onMigrate) onMigrate();
        else if (onDelete) onDelete();
      } catch {
        toast.error("Failed to clone note");
      }
    });
  };

  const noteId = note._id ?? note.key ?? "";

  // Strip markdown syntax for the snippet preview
  const snippet = note.content
    .replace(/#{1,6}\s/g, "")
    .replace(/\*\*|__|\*|_|~~|`{1,3}/g, "")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .slice(0, 130);

  const handleClick = () => {
    if (showConfirm) return;
    const url = isGuest ? `/notes/${noteId}?guest=1` : `/notes/${noteId}`;
    router.push(url);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setMenuOpen(false);
    if (!showConfirm) {
      setShowConfirm(true);
      return;
    }
    startTransition(async () => {
      try {
        if (isGuest) {
          await deleteGuestNote(noteId);
        } else {
          await deleteNote(noteId);
        }
        toast.success("Note deleted");
        onDelete?.();
        setShowConfirm(false);
      } catch {
        toast.error("Failed to delete note");
        setShowConfirm(false);
      }
    });
  };

  const handleTogglePublic = (e: React.MouseEvent) => {
    e.stopPropagation();
    setMenuOpen(false);
    if (isGuest) return;
    startTransition(async () => {
      try {
        await toggleNotePublic(noteId, !note.isPublic);
        toast.success(note.isPublic ? "Note set to private" : "Note is now public");
        onDelete?.(); // refetch
      } catch {
        toast.error("Failed to update sharing");
      }
    });
  };

  const handleCopyLink = (e: React.MouseEvent) => {
    e.stopPropagation();
    setMenuOpen(false);
    if (!note.shareId) {
      toast.error("Share ID not found");
      return;
    }
    const url = `${window.location.origin}/share/note/${note.shareId}`;
    navigator.clipboard.writeText(url);
    toast.success("Link copied to clipboard!");
  };

  const handleCloneToCloud = (e: React.MouseEvent) => {
    e.stopPropagation();
    setMenuOpen(false);
    if (!isSignedIn) {
      toast.error("Sign in to save to cloud");
      return;
    }
    startTransition(async () => {
      try {
        await migrateLocalNote({ title: note.title, content: note.content });
        toast.success("Note cloned to cloud!");
        onMigrate?.();
      } catch {
        toast.error("Clone failed");
      }
    });
  };

  const handleMoveToCloud = (e: React.MouseEvent) => {
    e.stopPropagation();
    setMenuOpen(false);
    if (!isSignedIn) {
      toast.error("Sign in to save to cloud");
      return;
    }
    startTransition(async () => {
      try {
        await migrateLocalNote({ title: note.title, content: note.content });
        await deleteGuestNote(noteId);
        toast.success("Note moved to cloud!");
        onMigrate?.();
      } catch {
        toast.error("Move failed");
      }
    });
  };

  return (
    <div
      onClick={handleClick}
      role="button"
      id={`note-card-${noteId}`}
      className="group relative flex flex-col gap-3 bg-white border-2 border-[#e9ecef] hover:border-[#6965db] hover:shadow-md transition-all cursor-pointer p-5 min-h-[180px]"
      style={{ borderRadius: "8px 2px 6px 2px / 2px 6px 2px 8px" }}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <FileText className="w-4 h-4 text-[#6965db] shrink-0" />
          <h3
            className="font-bold text-[#1e1e1e] text-sm truncate"
            style={{ fontFamily: "'Virgil', cursive" }}
          >
            {note.title || "Untitled Note"}
          </h3>
        </div>

        {/* Actions */}
        <div 
          ref={menuRef}
          className={`flex items-center gap-1 shrink-0 transition-opacity relative ${menuOpen ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              setMenuOpen(!menuOpen);
            }}
            className="p-1.5 rounded hover:bg-[#f3f0ff] text-[#868e96] hover:text-[#6965db] transition-colors"
          >
            <MoreVertical className="w-4 h-4" />
          </button>
          
          {menuOpen && (
            <div className="absolute right-0 top-8 mt-1 w-48 bg-white rounded-lg shadow-[0_4px_20px_rgba(0,0,0,0.08)] border border-[#e9ecef] py-1 z-20 flex flex-col font-sans">
              <button
                onClick={handleRename}
                className="w-full text-left px-4 py-2 text-sm text-[#495057] hover:bg-[#f3f0ff] hover:text-[#6965db] flex items-center gap-2 transition-colors"
              >
                <Edit2 className="w-3.5 h-3.5" /> Rename
              </button>
              
              {isGuest && isSignedIn && (
                <>
                  <button
                    onClick={handleCloneToCloud}
                    disabled={isPending}
                    className="w-full text-left px-4 py-2 text-sm text-[#495057] hover:bg-[#f3f0ff] hover:text-[#6965db] flex items-center gap-2 transition-colors disabled:opacity-50"
                  >
                    <Copy className="w-3.5 h-3.5" /> Copy to cloud
                  </button>
                  <button
                    onClick={handleMoveToCloud}
                    disabled={isPending}
                    className="w-full text-left px-4 py-2 text-sm text-[#495057] hover:bg-[#f3f0ff] hover:text-[#6965db] flex items-center gap-2 transition-colors disabled:opacity-50"
                  >
                    <Upload className="w-3.5 h-3.5" /> Move to cloud
                  </button>
                </>
              )}
              
              <button
                onClick={handleCloneLocal}
                disabled={isPending}
                className="w-full text-left px-4 py-2 text-sm text-[#495057] hover:bg-[#f3f0ff] hover:text-[#6965db] flex items-center gap-2 transition-colors disabled:opacity-50"
              >
                <Copy className="w-3.5 h-3.5" /> Clone locally
              </button>
              
              {!isGuest && (
                <>
                  <button
                    onClick={handleTogglePublic}
                    disabled={isPending}
                    className="w-full text-left px-4 py-2 text-sm text-[#495057] hover:bg-[#f3f0ff] hover:text-[#6965db] flex items-center gap-2 transition-colors disabled:opacity-50"
                  >
                    {note.isPublic ? <Lock className="w-3.5 h-3.5" /> : <Globe className="w-3.5 h-3.5" />}
                    {note.isPublic ? "Make private" : "Make public"}
                  </button>
                  {note.isPublic && (
                    <button
                      onClick={handleCopyLink}
                      className="w-full text-left px-4 py-2 text-sm text-[#495057] hover:bg-[#f3f0ff] hover:text-[#6965db] flex items-center gap-2 transition-colors"
                    >
                      <Link className="w-3.5 h-3.5" /> Copy share link
                    </button>
                  )}
                </>
              )}
              
              <div className="h-px bg-[#f1f3f5] my-1 mx-2" />
              
              <button
                onClick={handleDelete}
                disabled={isPending}
                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors disabled:opacity-50"
              >
                {isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                Delete
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Snippet */}
      <p className="text-xs text-[#868e96] leading-relaxed flex-1 line-clamp-4 font-sans">
        {snippet || <span className="italic">Empty note</span>}
      </p>

      {/* Footer */}
      <div className="flex items-center justify-between pt-1 border-t border-[#f1f3f5]">
        <div className="flex items-center gap-1 text-[10px] text-[#adb5bd]">
          <Clock className="w-3 h-3" />
          <span>{note.updatedAt ? formatTimeDate(note.updatedAt) : "just now"}</span>
        </div>
        {note.isPublic && (
          <span className="text-[10px] font-semibold text-[#6965db] flex items-center gap-1">
            <Globe className="w-3 h-3" /> Public
          </span>
        )}
        {isGuest && (
          <span className="text-[10px] font-semibold text-[#f59f00]">Local</span>
        )}
      </div>

      {/* Confirm overlay */}
      {showConfirm && (
        <div
          className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-white/90 backdrop-blur-sm rounded-xl z-10"
          onClick={(e) => e.stopPropagation()}
        >
          <p className="text-sm font-semibold text-[#1e1e1e]" style={{ fontFamily: "'Virgil', cursive" }}>Delete this note?</p>
          <div className="flex gap-2">
            <button
              onClick={handleDelete}
              className="px-4 py-1.5 bg-red-500 text-white text-xs font-bold rounded-lg hover:bg-red-600 transition-colors"
            >
              {isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : "Delete"}
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); setShowConfirm(false); }}
              className="px-4 py-1.5 bg-[#f1f3f5] text-[#495057] text-xs font-bold rounded-lg hover:bg-[#e9ecef] transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Rename Dialog */}
      {isRenameDialogOpen && (
        <Dialog open={true} onOpenChange={(open) => !open && setIsRenameDialogOpen(false)}>
          <DialogContent onClick={(e) => e.stopPropagation()}>
            <DialogHeader>
              <DialogTitle>Rename Note</DialogTitle>
            </DialogHeader>
            <form onSubmit={submitRename} className="flex flex-col gap-4 mt-2">
              <Input
                value={renameInputValue}
                onChange={(e) => setRenameInputValue(e.target.value)}
                placeholder="Enter note name"
                disabled={isPending}
                autoFocus
              />
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsRenameDialogOpen(false)}
                  disabled={isPending}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isPending}>
                  {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
