"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Loader2 } from "lucide-react";

interface CreateLocalButtonProps {
  asCard?: boolean;
}

export default function CreateLocalButton({ asCard = false }: CreateLocalButtonProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleCreate = () => {
    startTransition(() => {
      // Just redirect to an unused random ID. 
      // The actual indexedDB save triggers on first canvas change.
      const newId = crypto.randomUUID();
      router.push(`/draw/local/${newId}`);
    });
  };

  if (asCard) {
    return (
      <button
        onClick={handleCreate}
        disabled={isPending}
        className="group h-full bg-white border-2 border-dashed border-[#e9ecef] hover:border-[#f59f00] transition-all overflow-hidden flex flex-col items-center justify-center cursor-pointer disabled:opacity-50"
        style={{ borderRadius: "8px 2px 7px 3px / 3px 7px 2px 8px" }}
      >
        {isPending ? (
          <Loader2 className="w-8 h-8 text-[#adb5bd] animate-spin" />
        ) : (
          <>
            <div className="bg-[#fff9db] group-hover:bg-[#ffec99] p-3 rounded-xl transition-colors mb-3">
              <Plus className="w-6 h-6 text-[#fcc419] group-hover:text-[#e67700] transition-colors" />
            </div>
            <span
              className="text-sm font-semibold text-[#868e96] group-hover:text-[#e67700] transition-colors"
              style={{ fontFamily: "'Virgil', cursive" }}
            >
              New Local Drawing
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
      className="flex items-center gap-2 bg-[#f59f00] text-white font-semibold px-6 py-2.5 text-sm transition-all hover:bg-[#e67700] disabled:opacity-50 shadow-sm"
      style={{ borderRadius: "10px 3px 9px 3px / 3px 9px 3px 10px", fontFamily: "'Virgil', cursive" }}
    >
      {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
      New Offline Drawing
    </button>
  );
}
