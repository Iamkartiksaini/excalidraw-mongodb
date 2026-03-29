"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import { updateDrawing, togglePublic, renameDrawing } from "@/actions/drawingActions";
import { Save, Loader2, Check, Globe, Lock } from "lucide-react";
import { toast } from "sonner";
import { saveGuestDrawing, loadGuestDrawing } from "@/lib/guestStorage";

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

  // Load persisted guest data from IndexedDB on mount
  useEffect(() => {
    if (!isGuest) return;

    loadGuestDrawing().then((record) => {
      if (!record) return;

      // Update local state
      setElements(record.elements);
      setAppState(record.appState);
      setTitle(record.title);
      setGuestSavedOnce(true);

      // Hydrate the live canvas once the Excalidraw API is ready
      const tryUpdate = () => {
        if (excalidrawAPI.current) {
          excalidrawAPI.current.updateScene({
            elements: record.elements,
            appState: { ...record.appState, viewBackgroundColor: "#ffffff" },
          });
        } else {
          // Retry until the API is mounted
          setTimeout(tryUpdate, 100);
        }
      };
      tryUpdate();
    }).catch(() => {
      // Silently fail — guest just starts with a blank canvas
    });
  }, [isGuest]);

  const persistToIndexedDB = useCallback(async (els: any[], state: any, ttl: string) => {
    try {
      await saveGuestDrawing({ elements: els, appState: state, title: ttl });
      setGuestSavedOnce(true);
    } catch {
      // Auto-save failures are silent; manual save will show an error
    }
  }, []);

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

  return (
    <div style={{ height: "calc(100vh - 56px)", width: "100%", position: "relative" }}>
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


function CustomToolbar({
  title,
  setTitle,
  handleTitleBlur,
  handleSave,
  isSaving,
  saveSuccess,
  isGuest,
  guestSavedOnce,
  handleShare,
  isPublic,
}: any) {
  return (
    <div className="absolute h-11 top-4 Island App-toolbar left-[100px] z-[50] 
    flex items-center gap-1.5 bg-white p-1 rounded-[.5rem]  border border-[#e9ecef] pointer-events-auto"

      style={{ boxShadow: "0px 0px .931014px 0px #0000002b, 0px 0px 3.12708px 0px #00000014, 0px 7px 14px 0px #0000000d" }}
    >
      {/* Title */}
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onBlur={handleTitleBlur}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.currentTarget.blur();
          }
        }}
        className="px-2 py-1 text-sm font-bold text-[#1e1e1e] border border-transparent hover:border-[#e9ecef] rounded-lg outline-none w-30 focus:w-52 transition-all bg-transparent"
        placeholder="Untitled..."
        style={{ fontFamily: "'Virgil', cursive" }}
        aria-label="Drawing title"
      />

      <div className="w-px h-5 bg-[#e9ecef] mx-1" />

      {/* Save button */}
      <button
        onClick={handleSave}
        disabled={isSaving}
        title={isGuest ? "Save to browser" : "Save (Ctrl+S)"}
        className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold text-[#6965db] hover:bg-[#f3f0ff] rounded-lg transition-colors disabled:opacity-40"
        style={{ fontFamily: "'Virgil', cursive" }}
      >
        {isSaving ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : saveSuccess ? (
          <Check className="w-4 h-4 text-[#2f9e44]" />
        ) : (
          <Save className="w-4 h-4" />
        )}
        {saveSuccess ? "Saved!" : "Save"}
      </button>

      {/* Share button */}
      <button
        onClick={handleShare}
        title={isPublic ? "Make private" : "Share publicly"}
        className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold rounded-lg transition-colors ${isPublic ? "text-[#2f9e44] hover:bg-[#ebfbee]" : "text-[#868e96] bg-sky-50 hover:bg-[#f8f9fa]"
          }`}
      >
        {isPublic ? <Globe className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
      </button>

      {/* Guest indicator */}
      {isGuest && (
        <span
          className="ml-2 px-2 py-0.5 text-xs bg-[#fff9db] border border-[#f59f00] text-[#e67700] rounded-full whitespace-nowrap font-medium"
          style={{ fontFamily: "'Virgil', cursive" }}
        >
          {guestSavedOnce
            ? "Guest · saved locally"
            : "Guest · changes not cloud saved"}
        </span>
      )}
    </div>
  );
}