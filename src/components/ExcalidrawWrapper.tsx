"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import { updateDrawing, togglePublic, renameDrawing } from "@/actions/drawingActions";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { saveGuestDrawing } from "@/lib/guestStorage";
import CustomToolbar from "./CustomToolbar";

// Dynamically import with SSR disabled — required for Excalidraw
const ExcalidrawComponent = dynamic(
  async () => {
    const { Excalidraw } = await import("@excalidraw/excalidraw");
    return Excalidraw;
  },
  { ssr: false }
);

interface ExcalidrawWrapperProps {
  initialData: {
    _id: string;
    elements: any[];
    appState: any;
    title: string;
    isPublic: boolean;
    shareId: string;
    updatedAt?: string
  };
  isGuest?: boolean;
}

export default function ExcalidrawWrapper({ initialData, isGuest = false }: ExcalidrawWrapperProps) {
  const [elements, setElements] = useState<any[]>(initialData.elements || []);
  const [appState, setAppState] = useState<any>(initialData.appState || {});
  const [isSaving, setIsSaving] = useState(false);
  const [isPublic, setIsPublic] = useState(initialData.isPublic);
  const [title, setTitle] = useState(initialData.title);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [guestSavedOnce, setGuestSavedOnce] = useState(false);

  const excalidrawAPI = useRef<any>(null);
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const elementsRef = useRef(elements);
  const appStateRef = useRef(appState);
  const titleRef = useRef(title);
  const prevTitleRef = useRef(title);

  // Keep refs in sync for use inside auto-save closure
  useEffect(() => { elementsRef.current = elements; }, [elements]);
  useEffect(() => { appStateRef.current = appState; }, [appState]);
  useEffect(() => { titleRef.current = title; }, [title]);

  // Guest data is now pre-loaded by the page component and passed as initialData.
  // We just set guestSavedOnce to true if initialData elements are present and it's a guest.
  useEffect(() => {
    if (isGuest && initialData.elements.length > 0) {
      setGuestSavedOnce(true);
    }
  }, [isGuest, initialData]);

  const persistToIndexedDB = useCallback(async (els: any[], state: any, ttl: string) => {
    try {
      await saveGuestDrawing({ id: initialData._id, elements: els, appState: state, title: ttl });
      setGuestSavedOnce(true);
    } catch {
      // Auto-save failures are silent; manual save will show an error
    }
  }, [initialData._id]);

  const handleTitleBlur = async () => {
    if (title !== prevTitleRef.current) {
      prevTitleRef.current = title;
      if (isGuest) {
        handleSave();
      } else {
        try {
          await renameDrawing(initialData._id, title);
          toast.success("Name updated");
        } catch {
          toast.error("Failed to rename");
        }
      }
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveSuccess(false);
    try {
      if (isGuest) {
        await saveGuestDrawing({
          id: initialData._id,
          elements: elementsRef.current,
          appState: appStateRef.current,
          title: titleRef.current,
        });
        setGuestSavedOnce(true);
        toast.success("Saved to browser storage");
      } else {
        await updateDrawing(initialData._id, {
          elements,
          appState: { ...appState, collaborate: false },
          title,
        });
        toast.success("Drawing saved");
      }
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    } catch {
      toast.error("Failed to save");
    } finally {
      setIsSaving(false);
    }
  };

  const handleShare = async () => {
    if (isGuest) {
      toast.info("Sign in to share drawings");
      return;
    }
    try {
      const updated = await togglePublic(initialData._id, !isPublic);
      setIsPublic(updated.isPublic);
      if (updated.isPublic) {
        const shareUrl = `${window.location.origin}/share/${initialData.shareId}`;
        await navigator.clipboard.writeText(shareUrl);
        toast.success("Public link copied!");
      } else {
        toast.info("Drawing is now private");
      }
    } catch {
      toast.error("Failed to update sharing");
    }
  };

  const searchParams = useSearchParams();
  const from = searchParams.get("from") || (isGuest ? "local" : "live");

  console.log("updatedAt", initialData.updatedAt)

  return (
    <div style={{
      height: "calc(100vh - var(--navbar-height, 56px))",
      transformOrigin: "bottom center",
      width: "100%", position: "relative"
    }}>
      <CustomToolbar
        title={title}
        setTitle={setTitle}
        handleTitleBlur={handleTitleBlur}
        handleSave={handleSave}
        isSaving={isSaving}
        saveSuccess={saveSuccess}
        isGuest={isGuest}
        guestSavedOnce={guestSavedOnce}
        handleShare={handleShare}
        isPublic={isPublic}
        from={from}
        updatedAt={initialData.updatedAt}
      />
      <ExcalidrawComponent
        excalidrawAPI={(api) => (excalidrawAPI.current = api)}
        initialData={{
          elements: initialData.elements,
          appState: {
            ...initialData.appState,
            viewBackgroundColor: "#ffffff",
          },
        }}
        onChange={(els, state) => {
          setElements(els as any[]);
          setAppState(state);

          // Debounced auto-save for guest mode (1-second debounce)
          if (isGuest) {
            if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
            autoSaveTimer.current = setTimeout(() => {
              persistToIndexedDB(els as any[], state, titleRef.current);
            }, 1000);
          }
        }}
      />
    </div>
  );
}