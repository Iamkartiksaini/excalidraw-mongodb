"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function GuestDrawPage() {
  const router = useRouter();

  useEffect(() => {
    // Generate a fresh ID for a new local drawing
    const newId = crypto.randomUUID();
    router.replace(`/draw/local/${newId}`);
  }, [router]);

  return (
    <div
      className="flex items-center justify-center"
      style={{ height: "calc(100vh - 56px)" }}
    >
      <span className="text-sm text-[#868e96]" style={{ fontFamily: "'Virgil', cursive" }}>
        Creating a new drawing…
      </span>
    </div>
  );
}
