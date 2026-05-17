"use client";

import { useState, useTransition, useRef, useEffect } from "react";
import { Folder, Trash2, Loader2, Clock, MoreVertical, Edit2, Globe } from "lucide-react";
import { toast } from "sonner";
import { deleteFolder, updateFolder } from "@/actions/folderActions";
import formatTimeDate from "@/lib/time-date-formatter";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import ShareDialog from "@/components/ShareDialog";

interface FolderCardProps {
  folder: {
    _id: string;
    title: string;
    visibility?: "private" | "public" | "restricted";
    invitedEmails?: string[];
    shareId?: string;
    updatedAt?: string;
  };
  onDelete?: () => void;
}

export default function FolderCard({ folder, onDelete }: FolderCardProps) {
  const [isPending, startTransition] = useTransition();
  const [showConfirm, setShowConfirm] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false);
  const [renameInputValue, setRenameInputValue] = useState(folder.title);
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);

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
    setRenameInputValue(folder.title);
    setIsRenameDialogOpen(true);
  };

  const submitRename = (e: React.FormEvent) => {
    e.preventDefault();
    if (!renameInputValue || renameInputValue === folder.title) {
      setIsRenameDialogOpen(false);
      return;
    }

    startTransition(async () => {
      try {
        await updateFolder(folder._id, { title: renameInputValue });
        toast.success("Folder renamed successfully!");
        setIsRenameDialogOpen(false);
        onDelete?.(); // trigger refetch
      } catch (err: any) {
        toast.error(err.message || "Failed to rename folder");
      }
    });
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
        await deleteFolder(folder._id);
        toast.success("Folder deleted successfully!");
        onDelete?.();
        setShowConfirm(false);
      } catch (err: any) {
        toast.error(err.message || "Failed to delete folder");
        setShowConfirm(false);
      }
    });
  };

  const handleClick = () => {
    if (showConfirm) return;
    // In future iterations, this will open the folder view
    toast.info("Folder view will be added in upcoming features");
  };

  return (
    <div
      onClick={handleClick}
      role="button"
      id={`folder-card-${folder._id}`}
      className="group relative flex flex-col gap-3 bg-[#fffbeb] border-2 border-[#fde68a] hover:border-[#d97706] hover:shadow-md transition-all cursor-pointer p-5 min-h-[180px]"
      style={{ borderRadius: "8px 2px 6px 2px / 2px 6px 2px 8px" }}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <Folder className="w-5 h-5 text-[#d97706] shrink-0" />
          <h3
            className="font-bold text-[#1e1e1e] text-sm truncate"
            style={{ fontFamily: "'Virgil', cursive" }}
          >
            {folder.title || "Untitled Folder"}
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
            className="p-1.5 rounded hover:bg-[#fef3c7] text-[#868e96] hover:text-[#d97706] transition-colors"
          >
            <MoreVertical className="w-4 h-4" />
          </button>
          
          {menuOpen && (
            <div className="absolute right-0 top-8 mt-1 w-48 bg-white rounded-lg shadow-[0_4px_20px_rgba(0,0,0,0.08)] border border-[#e9ecef] py-1 z-20 flex flex-col font-sans">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setMenuOpen(false);
                  setIsShareDialogOpen(true);
                }}
                className="w-full text-left px-4 py-2 text-sm text-[#495057] hover:bg-[#fffbeb] hover:text-[#d97706] flex items-center gap-2 transition-colors"
              >
                <Globe className="w-3.5 h-3.5" /> Share
              </button>

              <button
                onClick={handleRename}
                className="w-full text-left px-4 py-2 text-sm text-[#495057] hover:bg-[#fffbeb] hover:text-[#d97706] flex items-center gap-2 transition-colors"
              >
                <Edit2 className="w-3.5 h-3.5" /> Rename
              </button>
              
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

      {/* Description / Placeholder content */}
      <p className="text-xs text-[#b45309] leading-relaxed flex-1 font-sans">
        Organize notes in this folder.
      </p>

      {/* Footer */}
      <div className="flex items-center justify-between pt-1 border-t border-[#fde68a]">
        <div className="flex items-center gap-1 text-[10px] text-[#b45309]">
          <Clock className="w-3 h-3" />
          <span>{folder.updatedAt ? formatTimeDate(folder.updatedAt) : "just now"}</span>
        </div>
        <span className="text-[10px] font-semibold text-[#d97706]">
          Folder
        </span>
      </div>

      {/* Confirm overlay */}
      {showConfirm && (
        <div
          className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-white/90 backdrop-blur-sm rounded-xl z-10"
          onClick={(e) => e.stopPropagation()}
        >
          <p className="text-sm font-semibold text-[#1e1e1e]" style={{ fontFamily: "'Virgil', cursive" }}>Delete this folder?</p>
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
              <DialogTitle>Rename Folder</DialogTitle>
            </DialogHeader>
            <form onSubmit={submitRename} className="flex flex-col gap-4 mt-2">
              <Input
                value={renameInputValue}
                onChange={(e) => setRenameInputValue(e.target.value)}
                placeholder="Enter folder name"
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

      {/* Share Dialog */}
      {isShareDialogOpen && (
        <ShareDialog
          isOpen={true}
          onClose={() => setIsShareDialogOpen(false)}
          entityId={folder._id}
          entityType="folder"
          initialVisibility={folder.visibility || "private"}
          initialInvitedEmails={folder.invitedEmails || []}
          shareId={folder.shareId}
          onUpdate={onDelete}
        />
      )}
    </div>
  );
}
