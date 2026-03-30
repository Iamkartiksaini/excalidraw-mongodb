"use client";

import { useState, useRef, useEffect } from "react";
import { Clock, MoreVertical, Pencil, Trash2, Edit2, CloudUpload, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
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
import { deleteGuestDrawing, renameGuestDrawing, loadGuestDrawing } from "@/lib/guestStorage";
import { createDrawing, migrateLocalToCloud } from "@/actions/drawingActions";
import { useQueryClient } from "@tanstack/react-query";

interface LocalDrawingCardProps {
  drawing: {
    key: string;
    title: string;
    updatedAt: string;
  };
  isLoggedIn: boolean;
  onUpdate: () => void;
}

export default function LocalDrawingCard({ drawing, isLoggedIn, onUpdate }: LocalDrawingCardProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [showMenu, setShowMenu] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
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
      await deleteGuestDrawing(drawing.key);
      toast.success("Local drawing deleted successfully");
      onUpdate();
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
      await renameGuestDrawing(drawing.key, trimmedTitle);
      toast.success("Drawing renamed successfully");
      setIsRenaming(false);
      onUpdate();
    } catch (error) {
      toast.error("Failed to rename drawing");
    }
  };

  const handleUploadToCloud = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowMenu(false);
    setIsUploading(true);

    try {
      // 1. Fetch full data from IndexedDB
      const fullData = await loadGuestDrawing(drawing.key);
      if (!fullData) throw new Error("Could not load drawing data");

      // 2. Securely migrate to cloud in a single step
      await migrateLocalToCloud({
        title: fullData.title,
        elements: fullData.elements,
        appState: fullData.appState,
      });

      toast.success("Drawing uploaded to Cloud! Local copy preserved.");
      onUpdate(); // Refresh the list
      queryClient.invalidateQueries({ queryKey: ["drawings", "live"] });
    } catch (error) {
      console.error(error);
      toast.error("Failed to upload drawing to cloud");
    } finally {
      setIsUploading(false);
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

  const updatedAt = new Date(drawing.updatedAt);
  const now = new Date();
  
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const drawDate = new Date(updatedAt.getFullYear(), updatedAt.getMonth(), updatedAt.getDate());

  const isToday = drawDate.getTime() === today.getTime();
  const isYesterday = drawDate.getTime() === yesterday.getTime();
  const isSameYear = updatedAt.getFullYear() === now.getFullYear();

  const timeString = updatedAt.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });

  let dateAndTime = "";
  if (isToday) {
    dateAndTime = `Today at ${timeString}`;
  } else if (isYesterday) {
    dateAndTime = `Yesterday at ${timeString}`;
  } else {
    dateAndTime = updatedAt.toLocaleDateString("en-US", { 
        month: "short", 
        day: "numeric", 
        ...(isSameYear ? {} : { year: "numeric" })
    });
  }

  return (
    <div
      className="group bg-white border-2 border-[#e9ecef] hover:border-[#f59f00] transition-all flex flex-col shadow-sm hover:shadow-md relative"
      style={{ borderRadius: "8px 2px 7px 3px / 3px 7px 2px 8px" }}
    >
      {/* Clickable area for the card */}
      {!isRenaming && (
        <Link href={`/draw/local/${drawing.key}?from=local`} className="absolute inset-0 z-0" aria-label={`Open ${drawing.title}`} />
      )}

      {/* Preview area */}
      <div
        className="aspect-4/3 bg-[#fff9db] border-b-2 border-dashed border-[#e9ecef] flex items-center justify-center group-hover:bg-[#ffec99] transition-colors relative z-0 pointer-events-none"
        style={{ borderRadius: "6px 2px 0px 0px / 3px 6px 0px 0px" }}
      >
        <Pencil className="w-8 h-8 text-[#fcc419] group-hover:text-[#e67700] transition-colors opacity-50 group-hover:opacity-100" />
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
              className="w-full font-bold text-[#1e1e1e] text-lg bg-transparent border-b-2 border-[#f59f00] outline-none placeholder-[#868e96]"
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
            {dateAndTime} (Local)
          </p>
        </div>

        {/* Options */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={toggleMenu}
            disabled={isUploading}
            className="p-1.5 text-[#868e96] hover:text-[#1e1e1e] hover:bg-[#fff9db] rounded-md transition-colors border-2 border-transparent hover:border-[#1e1e1e] disabled:opacity-50"
            style={{ borderRadius: "4px 8px 6px 4px / 6px 3px 5px 8px" }}
            aria-label="Options"
          >
            {isUploading ? <Loader2 className="w-5 h-5 animate-spin text-[#f59f00]" /> : <MoreVertical className="w-5 h-5" />}
          </button>

          {showMenu && (
            <div
              className="absolute right-0 top-full mt-1 w-44 bg-white border-2 border-[#1e1e1e] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] z-50 py-1 overflow-hidden"
              style={{ fontFamily: "'Virgil', cursive", borderRadius: "8px 2px 7px 3px / 3px 7px 2px 8px" }}
            >
              <div
                onClick={handleRenameClick}
                className="w-full px-3 py-2 text-sm text-left flex items-center gap-2 hover:bg-[#fff9db] hover:text-[#e67700] text-[#1e1e1e] transition-colors font-semibold cursor-pointer"
              >
                <Edit2 className="w-4 h-4" />
                Rename
              </div>
              
              {isLoggedIn && (
                <div
                  onClick={handleUploadToCloud}
                  className="w-full px-3 py-2 text-sm text-left flex items-center gap-2 hover:bg-[#ebfbee] hover:text-[#2b8a3e] text-[#1e1e1e] transition-colors font-semibold cursor-pointer border-t border-dashed border-[#e9ecef]"
                >
                  <CloudUpload className="w-4 h-4" />
                  Upload to Cloud
                </div>
              )}
              
              <div
                onClick={handleDeleteClick}
                className="w-full px-3 py-2 text-sm text-left flex items-center gap-2 hover:bg-[#ffe3e3] hover:text-[#fa5252] text-[#1e1e1e] transition-colors font-semibold cursor-pointer border-t border-dashed border-[#e9ecef]"
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
              local drawing "{drawing.title}".
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
