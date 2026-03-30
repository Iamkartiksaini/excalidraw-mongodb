"use client";

import { useState, useRef, useEffect } from "react";
import { Clock, MoreVertical, Pencil, Trash2, Edit2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { deleteDrawing, renameDrawing } from "@/actions/drawingActions";
import { toast } from "sonner";
import Link from "next/link";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import formatTimeDate from "@/lib/time-date-formatter";

interface DrawingCardProps {
  drawing: {
    _id: string;
    title: string;
    updatedAt: string;
  };
}

export default function DrawingCard({ drawing }: DrawingCardProps) {
  const router = useRouter();
  const [showMenu, setShowMenu] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const [newTitle, setNewTitle] = useState(drawing.title);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowMenu(false);
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    try {
      await deleteDrawing(drawing._id);
      toast.success("Drawing deleted successfully");
      router.refresh();
    } catch (error) {
      toast.error("Failed to delete drawing");
    } finally {
      setShowDeleteDialog(false);
    }
  };

  const handleRenameSubmit = async (e: React.FormEvent | React.FocusEvent | React.KeyboardEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const trimmedTitle = newTitle.trim();
    if (!trimmedTitle || trimmedTitle === drawing.title) {
      setIsRenaming(false);
      setNewTitle(drawing.title);
      return;
    }

    try {
      await renameDrawing(drawing._id, trimmedTitle);
      toast.success("Drawing renamed successfully");
      setIsRenaming(false);
      router.refresh();
    } catch (error) {
      toast.error("Failed to rename drawing");
    }
  };

  const toggleMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowMenu(!showMenu);
  };

  const handleRenameClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowMenu(false);
    setIsRenaming(true);
  };

  const dateAndTime = formatTimeDate(drawing.updatedAt);

  return (
    <div
      className="group bg-white border-2 border-[#e9ecef] hover:border-[#6965db] transition-all flex flex-col shadow-sm hover:shadow-md relative"
      style={{ borderRadius: "8px 2px 7px 3px / 3px 7px 2px 8px" }}
    >
      {/* Clickable area for the card */}
      {!isRenaming && (
        <Link href={`/draw/${drawing._id}`} className="absolute inset-0 z-0" aria-label={`Open ${drawing.title}`} />
      )}

      {/* Preview area */}
      <div
        className="aspect-4/3 bg-[#f8f9fa] border-b-2 border-dashed border-[#e9ecef] flex items-center justify-center group-hover:bg-[#f3f0ff] transition-colors relative z-0 pointer-events-none"
        style={{ borderRadius: "6px 2px 0px 0px / 3px 6px 0px 0px" }}
      >
        <Pencil className="w-8 h-8 text-[#dee2e6] group-hover:text-[#6965db] transition-colors opacity-50 group-hover:opacity-100" />
      </div>

      <div className="p-4 bg-white flex justify-between items-start gap-2 relative z-10" style={{ borderRadius: "0 0 7px 3px / 0 0 2px 8px" }}>
        <div className="flex-1 min-w-0">
          {isRenaming ? (
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              onBlur={handleRenameSubmit}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleRenameSubmit(e);
                if (e.key === "Escape") {
                  setIsRenaming(false);
                  setNewTitle(drawing.title);
                }
              }}
              autoFocus
              className="w-full font-bold text-[#1e1e1e] text-lg bg-transparent border-b-2 border-[#6965db] outline-none placeholder-[#868e96]"
              style={{ fontFamily: "'Virgil', cursive" }}
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
            />
          ) : (
            <p className="font-bold text-[#1e1e1e] truncate mb-1.5 text-lg" style={{ fontFamily: "'Virgil', cursive", pointerEvents: "none" }}>
              {drawing.title}
            </p>
          )}
          <p className="text-xs font-medium text-[#868e96] flex items-center gap-1.5" style={{ pointerEvents: "none" }}>
            <Clock className="w-3.5 h-3.5" />
            {dateAndTime}
          </p>
        </div>

        {/* Options */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={toggleMenu}
            className="p-1.5 text-[#868e96] hover:text-[#1e1e1e] hover:bg-[#f8f9fa] rounded-md transition-colors border-2 border-transparent hover:border-[#1e1e1e]"
            style={{ borderRadius: "4px 8px 6px 4px / 6px 3px 5px 8px" }}
            aria-label="Options"
          >
            <MoreVertical className="w-5 h-5" />
          </button>

          {showMenu && (
            <div
              className="absolute right-0 top-full mt-1 w-36 bg-white border-2 border-[#1e1e1e] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] z-50 py-1 overflow-hidden"
              style={{ fontFamily: "'Virgil', cursive", borderRadius: "8px 2px 7px 3px / 3px 7px 2px 8px" }}
            >
              <div
                onClick={handleRenameClick}
                className="w-full px-3 py-2 text-sm text-left flex items-center gap-2 hover:bg-[#f3f0ff] hover:text-[#6965db] text-[#1e1e1e] transition-colors font-semibold cursor-pointer"
              >
                <Edit2 className="w-4 h-4" />
                Rename
              </div>
              <div
                onClick={handleDeleteClick}
                className="w-full px-3 py-2 text-sm text-left flex items-center gap-2 hover:bg-[#ffe3e3] hover:text-[#fa5252] text-[#1e1e1e] transition-colors font-semibold cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent onClick={(e) => e.stopPropagation()}>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your
              drawing "{drawing.title}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={(e) => e.stopPropagation()}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => { e.stopPropagation(); confirmDelete(); }}
              className="bg-[#fa5252] text-white hover:bg-[#e03131]"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
