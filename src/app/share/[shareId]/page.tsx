"use client";

import { use, useEffect, useState } from "react";
import { getPublicDrawing } from "@/actions/drawingActions";
import { useAuth } from "@clerk/nextjs";
import ShareExcalidrawClient from "./ShareExcalidrawClient";

interface SharePageProps {
  params: Promise<{
    shareId: string;
  }>;
}

export default function SharePage({ params }: SharePageProps) {
  const { shareId } = use(params);
  const { userId, isLoaded } = useAuth();
  const [drawing, setDrawing] = useState<any>(null);
  const [error, setError] = useState<boolean>(false);

  useEffect(() => {
    getPublicDrawing(shareId)
      .then((data) => setDrawing(data))
      .catch(() => setError(true));
  }, [shareId]);

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center h-[calc(100vh-64px)]">
        <p className="text-red-500 font-semibold" style={{ fontFamily: "'Virgil', cursive" }}>Drawing not found.</p>
      </div>
    );
  }

  if (!drawing || !isLoaded) {
    return (
      <div className="flex-1 flex items-center justify-center h-[calc(100vh-64px)]">
        <p className="text-zinc-500 font-semibold" style={{ fontFamily: "'Virgil', cursive" }}>Loading drawing...</p>
      </div>
    );
  }
  return (
    <div className="flex-1 flex flex-col relative h-[calc(100vh-64px)] overflow-hidden">
      <ShareExcalidrawClient drawing={drawing} isLoggedIn={userId ? true : false} />
    </div>
  );
}
