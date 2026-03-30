"use client";

import { useEffect, useState, Suspense } from "react";
import ExcalidrawWrapper from "@/components/ExcalidrawWrapper";
import { loadGuestDrawing } from "@/lib/guestStorage";
import { use } from "react";

const DEFAULT_GUEST_DATA = {
  elements: [] as any[],
  appState: {} as any,
  title: "Guest Drawing",
  isPublic: false,
  shareId: "",
};

export default function LocalDrawingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  
  const [guestData, setGuestData] = useState<any>(null);
  const [ready, setReady] = useState(false);
  
  useEffect(() => {
    loadGuestDrawing(id)
      .then((record) => {
        if (record) {
          setGuestData({
            ...DEFAULT_GUEST_DATA,
            _id: record.key,
            elements: record.elements,
            appState: record.appState,
            title: record.title,
            updatedAt: record.updatedAt,
          });
        } else {
          setGuestData({
            ...DEFAULT_GUEST_DATA,
            _id: id,
          });
        }
      })
      .catch(() => {
        setGuestData({
          ...DEFAULT_GUEST_DATA,
          _id: id,
        });
      })
      .finally(() => setReady(true));
  }, [id]);

  if (!ready || !guestData) {
    return (
      <div className="flex items-center justify-center" style={{ height: "calc(100vh - 56px)" }}>
        <span className="text-sm text-[#868e96]" style={{ fontFamily: "'Virgil', cursive" }}>
          Loading your drawing…
        </span>
      </div>
    );
  }

  return (
    <Suspense fallback={
      <div className="flex items-center justify-center" style={{ height: "calc(100vh - 56px)" }}>
        <span className="text-sm text-[#868e96]" style={{ fontFamily: "'Virgil', cursive" }}>
          Loading editor…
        </span>
      </div>
    }>
      <ExcalidrawWrapper initialData={guestData} isGuest={true} />
    </Suspense>
  );
}
