"use client";

import { useState, useTransition } from "react";
import { FolderPlus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { createFolder } from "@/actions/folderActions";

interface CreateFolderButtonProps {
  asCard?: boolean;
  onCreated?: () => void;
}

export default function CreateFolderButton({ asCard, onCreated }: CreateFolderButtonProps) {
  const [isPending, startTransition] = useTransition();

  const handleCreate = () => {
    startTransition(async () => {
      try {
        await createFolder();
        toast.success("Folder created successfully!");
        onCreated?.();
      } catch (err: any) {
        toast.error(err.message || "Failed to create folder");
      }
    });
  };

  if (asCard) {
    return (
      <button
        onClick={handleCreate}
        disabled={isPending}
        id="create-folder-card-btn"
        className="group relative flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-[#fde68a] bg-[#fffbeb] hover:border-[#d97706] hover:bg-[#fef3c7] transition-all min-h-[180px] cursor-pointer disabled:opacity-60"
        style={{ borderRadius: "10px 3px 9px 3px / 3px 9px 3px 10px" }}
      >
        {isPending ? (
          <Loader2 className="w-8 h-8 text-[#d97706] animate-spin" />
        ) : (
          <FolderPlus className="w-8 h-8 text-[#d97706] group-hover:scale-110 transition-transform" />
        )}
        <span
          className="text-sm font-semibold text-[#d97706]"
          style={{ fontFamily: "'Virgil', cursive" }}
        >
          {isPending ? "Creating…" : "New Folder"}
        </span>
      </button>
    );
  }

  return (
    <button
      onClick={handleCreate}
      disabled={isPending}
      id="create-folder-btn"
      className="flex items-center gap-2 bg-[#d97706] text-white font-bold px-6 py-3 text-sm transition-all hover:bg-[#b45309] shadow-md disabled:opacity-60"
      style={{ borderRadius: "10px 3px 9px 3px / 3px 9px 3px 10px", fontFamily: "'Virgil', cursive" }}
    >
      {isPending ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <FolderPlus className="w-4 h-4" />
      )}
      {isPending ? "Creating…" : "New Folder"}
    </button>
  );
}
