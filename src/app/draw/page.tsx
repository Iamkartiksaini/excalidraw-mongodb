"use client";

import { useEffect, useState } from "react";
import ExcalidrawWrapper from "@/components/ExcalidrawWrapper";
import { loadGuestDrawing } from "@/lib/guestStorage";

const DEFAULT_GUEST_DATA = {
  _id: "",
  elements: [] as any[],
  appState: {} as any,
  title: "Guest Drawing",
  isPublic: false,
  shareId: "",
};

export default function GuestDrawPage() {
  const [guestData, setGuestData] = useState(DEFAULT_GUEST_DATA);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    loadGuestDrawing()
      .then((record) => {
        if (record) {
          setGuestData({
            ...DEFAULT_GUEST_DATA,
            elements: record.elements,
            appState: record.appState,
            title: record.title,
          });
        }
      })
      .catch(() => {
        // Fallback to default blank drawing on any error
      })
      .finally(() => setReady(true));
  }, []);

  // Show nothing until IndexedDB has been queried, avoids flash of blank canvas
  // that would be immediately overwritten by the load effect in ExcalidrawWrapper
  if (!ready) {
    return (
      <div
        className="flex items-center justify-center"
        style={{ height: "calc(100vh - 56px)" }}
      >
        <span className="text-sm text-[#868e96]" style={{ fontFamily: "'Virgil', cursive" }}>
          Loading your drawing…
        </span>
      </div>
    );
  }

  return <ExcalidrawWrapper initialData={guestData} isGuest={true} />;
}
