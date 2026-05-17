"use client";

import { use, useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { getPublicNote } from "@/actions/noteActions";
import ShareNoteClient from "./ShareNoteClient";
import { FileText } from "lucide-react";

interface ShareNotePageProps {
  params: Promise<{
    shareId: string;
  }>;
}

export default function ShareNotePage({ params }: ShareNotePageProps) {
  const { shareId } = use(params);
  const { userId, isLoaded } = useAuth();
  const [note, setNote] = useState<any>(null);
  const [error, setError] = useState<boolean>(false);

  useEffect(() => {
    getPublicNote(shareId)
      .then((data) => setNote(data))
      .catch(() => setError(true));
  }, [shareId]);

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center h-[calc(100vh-64px)]">
        <p className="text-red-500 font-semibold" style={{ fontFamily: "'Virgil', cursive" }}>Note not found.</p>
      </div>
    );
  }

  if (!note || !isLoaded) {
    return (
      <div className="flex-1 flex items-center justify-center h-[calc(100vh-64px)]">
        <p className="text-[#868e96] font-semibold flex items-center gap-2" style={{ fontFamily: "'Virgil', cursive" }}>
          <FileText className="w-5 h-5 animate-pulse" /> Loading note...
        </p>
      </div>
    );
  }

  return <ShareNoteClient note={note} clerkUserId={userId || undefined} />;
}
