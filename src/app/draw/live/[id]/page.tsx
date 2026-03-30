import { getDrawingById } from "@/actions/drawingActions";
import ExcalidrawWrapper from "@/components/ExcalidrawWrapper";
import { notFound } from "next/navigation";
import { Suspense } from "react";

interface DrawingPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function DrawingPage({ params }: DrawingPageProps) {
  try {
    const { id } = await params;
    const drawing = await getDrawingById(id);

    return (
      <Suspense fallback={
        <div className="flex items-center justify-center flex-1 bg-white">
          <span className="text-sm text-[#868e96]" style={{ fontFamily: "'Virgil', cursive" }}>Loading board…</span>
        </div>
      }>
        <ExcalidrawWrapper initialData={drawing} />
      </Suspense>
    );
  } catch (error: any) {
    if (error.message === "Drawing not found") {
      notFound();
    }
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-zinc-50">
        <div className="bg-white p-8 rounded-3xl border shadow-xl text-center max-w-md">
          <h1 className="text-2xl font-bold text-red-600 mb-2">Access Denied</h1>
          <p className="text-zinc-500 mb-6">
            You don't have permission to view this drawing or it doesn't exist.
          </p>
          <a
            href="/dashboard"
            className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-indigo-700 inline-block"
          >
            Back to Dashboard
          </a>
        </div>
      </div>
    );
  }
}
