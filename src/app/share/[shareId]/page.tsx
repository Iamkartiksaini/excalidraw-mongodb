import { getPublicDrawing } from "@/actions/drawingActions";
import dynamic from "next/dynamic";
import { notFound } from "next/navigation";
import { Move, Lock } from "lucide-react";

const Excalidraw = dynamic(
  async () => (await import("@excalidraw/excalidraw")).Excalidraw,
  { ssr: false }
);

interface SharePageProps {
  params: {
    shareId: string;
  };
}

export default async function SharePage({ params }: SharePageProps) {
  try {
    const { shareId } = await params;
    const drawing = await getPublicDrawing(shareId);

    return (
      <div className="flex-1 flex flex-col relative h-[calc(100vh-64px)] overflow-hidden">
        {/* Header Overlay */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-6 py-3 bg-white/90 backdrop-blur shadow-xl border rounded-2xl">
          <Lock className="w-4 h-4 text-zinc-400" />
          <h1 className="font-bold text-lg">{drawing.title}</h1>
          <span className="px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-500 text-xs font-semibold">
             READ ONLY
          </span>
        </div>

        <div className="flex-1">
          <Excalidraw
            initialData={{
              elements: drawing.elements,
              appState: { ...drawing.appState, viewModeEnabled: true, viewBackgroundColor: "#ffffff" },
            }}
            viewModeEnabled={true}
          />
        </div>

        {/* Floating CTA */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-50">
          <a
            href="/"
            className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-full font-semibold shadow-2xl hover:bg-indigo-700 transition-all hover:scale-105"
          >
            Create Your Own Board
          </a>
        </div>
      </div>
    );
  } catch (error) {
    notFound();
  }
}
