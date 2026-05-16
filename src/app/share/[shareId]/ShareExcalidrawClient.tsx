"use client";

import dynamic from "next/dynamic";

const ExcalidrawComponent = dynamic(
  async () => {
    const { Excalidraw } = await import("@excalidraw/excalidraw");
    return Excalidraw;
  },
  { ssr: false }
);

interface ShareExcalidrawClientProps {
  drawing: any;
}

export default function ShareExcalidrawClient({ drawing }: ShareExcalidrawClientProps) {
  return (
    <div style={{ height: "100%", width: "100%", position: "relative" }}>
      <ExcalidrawComponent
        initialData={{
          elements: drawing.elements,
          appState: {
            ...drawing.appState,
            viewModeEnabled: true,
            viewBackgroundColor: "#ffffff",
          },
        }}
        viewModeEnabled={true}
      />
    </div>
  );
}
