"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { nanoid } from "nanoid";
import ShareToolbar from "@/components/ShareToolbar";
import { migrateLocalToCloud } from "@/actions/drawingActions";
import { saveGuestDrawing } from "@/lib/guestStorage";

const ExcalidrawComponent = dynamic(
  async () => {
    const { Excalidraw } = await import("@excalidraw/excalidraw");
    return Excalidraw;
  },
  { ssr: false }
);

interface ShareExcalidrawClientProps {
  drawing: any;
  isLoggedIn: boolean;
}

export default function ShareExcalidrawClient({ drawing, isLoggedIn }: ShareExcalidrawClientProps) {
  const router = useRouter();
  const [elements, setElements] = useState<any[]>(drawing.elements || []);
  const [appState, setAppState] = useState<any>(drawing.appState || {});
  const [title, setTitle] = useState(drawing.title || "Untitled Drawing");
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveToCloud = async () => {
    setIsSaving(true);
    try {
      await migrateLocalToCloud({
        title,
        elements,
        appState: { ...appState, collaborate: false },
      });
      toast.success("Saved to Cloud!");
      router.push("/dashboard?tab=live");
    } catch (error) {
      toast.error("Failed to save to cloud");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveToLocal = async () => {
    setIsSaving(true);
    try {
      const newId = nanoid();
      await saveGuestDrawing({
        id: newId,
        elements,
        appState,
        title,
      });
      toast.success("Saved to Local Storage!");
      router.push("/dashboard?tab=local");
    } catch (error) {
      toast.error("Failed to save locally");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div style={{ height: "calc(100vh - var(--navbar-height, 56px))", width: "100%", position: "relative" }}>
      <ShareToolbar
        title={title}
        setTitle={setTitle}
        isLoggedIn={isLoggedIn}
        onSaveToCloud={handleSaveToCloud}
        onSaveToLocal={handleSaveToLocal}
        isSaving={isSaving}
      />
      <ExcalidrawComponent
        initialData={{
          elements: drawing.elements,
          appState: {
            ...drawing.appState,
            viewBackgroundColor: "#ffffff",
          },
        }}
        onChange={(els, state) => {
          setElements(els as any[]);
          setAppState(state);
        }}
      />
    </div>
  );
}
