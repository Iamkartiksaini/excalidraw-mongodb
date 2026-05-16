"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { PlusCircle, Loader2, FileText } from "lucide-react";
import { toast } from "sonner";
import { createNote } from "@/actions/noteActions";
import { saveGuestNote } from "@/lib/guestStorage";
import { nanoid } from "nanoid";
import { useUser } from "@clerk/nextjs";

interface CreateNoteButtonProps {
  asCard?: boolean;
  isLocal?: boolean;
}

export default function CreateNoteButton({ asCard, isLocal }: CreateNoteButtonProps) {
  const router = useRouter();
  const { isSignedIn } = useUser();
  const [isPending, startTransition] = useTransition();

  const handleCreate = () => {
    startTransition(async () => {
      try {
        if (isSignedIn && !isLocal) {
          const note = await createNote();
          router.push(`/notes/${note._id}`);
        } else {
          // Guest or explicitly local: create in IndexedDB then open local editor
          const id = nanoid();
          await saveGuestNote({ id, title: "Untitled Note", content: "" });
          router.push(`/notes/${id}?guest=1`);
        }
      } catch {
        toast.error("Failed to create note");
      }
    });
  };

  if (asCard) {
    return (
      <button
        onClick={handleCreate}
        disabled={isPending}
        id="create-note-card-btn"
        className="group relative flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-[#d0c8f8] bg-[#f3f0ff] hover:border-[#6965db] hover:bg-[#eceaff] transition-all min-h-[180px] cursor-pointer disabled:opacity-60"
        style={{ borderRadius: "10px 3px 9px 3px / 3px 9px 3px 10px" }}
      >
        {isPending ? (
          <Loader2 className="w-8 h-8 text-[#6965db] animate-spin" />
        ) : (
          <PlusCircle className="w-8 h-8 text-[#6965db] group-hover:scale-110 transition-transform" />
        )}
        <span
          className="text-sm font-semibold text-[#6965db]"
          style={{ fontFamily: "'Virgil', cursive" }}
        >
          {isPending ? "Creating…" : "New Note"}
        </span>
      </button>
    );
  }

  return (
    <button
      onClick={handleCreate}
      disabled={isPending}
      id="create-note-btn"
      className="flex items-center gap-2 bg-[#6965db] text-white font-bold px-6 py-3 text-sm transition-all hover:bg-[#5854c4] shadow-md disabled:opacity-60"
      style={{ borderRadius: "10px 3px 9px 3px / 3px 9px 3px 10px", fontFamily: "'Virgil', cursive" }}
    >
      {isPending ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <FileText className="w-4 h-4" />
      )}
      {isPending ? "Creating…" : "New Note"}
    </button>
  );
}
