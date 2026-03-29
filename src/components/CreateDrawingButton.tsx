"use client";

import { useTransition } from "react";
import { createDrawing } from "@/actions/drawingActions";
import { useRouter } from "next/navigation";
import { Plus, Loader2 } from "lucide-react";

interface CreateDrawingButtonProps {
  asCard?: boolean;
}

export default function CreateDrawingButton({ asCard = false }: CreateDrawingButtonProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleCreate = () => {
    startTransition(async () => {
      try {
        const drawing = await createDrawing("Untitled Drawing");
        router.push(`/draw/${drawing._id}`);
      } catch (error) {
        console.error("Failed to create drawing:", error);
      }
    });
  };

  if (asCard) {
    return (
      <button
        onClick={handleCreate}
        disabled={isPending}
        className="group h-full bg-white border-2 border-dashed border-[#e9ecef] hover:border-[#6965db] transition-all overflow-hidden flex flex-col aspect-[4/3] items-center justify-center cursor-pointer disabled:opacity-50"
        style={{ borderRadius: "8px 2px 7px 3px / 3px 7px 2px 8px" }}
      >
        {isPending ? (
          <Loader2 className="w-8 h-8 text-[#adb5bd] animate-spin" />
        ) : (
          <>
            <div className="bg-[#f8f9fa] group-hover:bg-[#e0d6ff] p-3 rounded-xl transition-colors mb-3">
              <Plus className="w-6 h-6 text-[#adb5bd] group-hover:text-[#6965db] transition-colors" />
            </div>
            <span
              className="text-sm font-semibold text-[#868e96] group-hover:text-[#6965db] transition-colors"
              style={{ fontFamily: "'Virgil', cursive" }}
            >
              New Drawing
            </span>
          </>
        )}
      </button>
    );
  }

  return (
    <button
      onClick={handleCreate}
      disabled={isPending}
      className="flex items-center gap-2 bg-[#6965db] text-white font-semibold px-6 py-2.5 text-sm transition-all hover:bg-[#5854c4] disabled:opacity-50 shadow-sm"
      style={{ borderRadius: "10px 3px 9px 3px / 3px 9px 3px 10px", fontFamily: "'Virgil', cursive" }}
    >
      {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
      New Drawing
    </button>
  );
}
