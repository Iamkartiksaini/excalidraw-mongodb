import { getUserDrawings } from "@/actions/drawingActions";
import { PenLine } from "lucide-react";
import CreateDrawingButton from "@/components/CreateDrawingButton";
import DrawingCard from "@/components/DrawingCard";

export default async function DashboardPage() {
  const drawings = await getUserDrawings();

  return (
    <div className="max-w-7xl mx-auto pt-10 px-4 pb-20 w-full">
      <div className="flex items-center justify-between mb-10">
        <h1
          className="text-3xl font-bold text-[#1e1e1e] tracking-tight"
          style={{ fontFamily: "'Virgil', cursive" }}
        >
          My Drawings
        </h1>
        <CreateDrawingButton />
      </div>

      {drawings.length === 0 ? (
        <div
          className="grid grid-cols-[repeat(auto-fill,minmax(250px,1fr))]  items-center justify-center py-24 border-2 border-dashed border-[#e9ecef] bg-[#f8f9fa] shadow-sm"
          style={{ borderRadius: "12px 4px 10px 4px / 4px 10px 4px 12px" }}
        >
          <div className="bg-[#e0d6ff] p-4 rounded-full mb-4">
            <PenLine className="w-10 h-10 text-[#6965db]" />
          </div>
          <p
            className="text-xl font-semibold text-[#1e1e1e] mb-2"
            style={{ fontFamily: "'Virgil', cursive" }}
          >
            No drawings yet
          </p>
          <p className="text-sm text-[#868e96] mb-8 font-medium">
            Create your first board to get started
          </p>
          <CreateDrawingButton />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {drawings.map((drawing: any) => (
            <DrawingCard key={drawing._id} drawing={drawing} />
          ))}

          {/* New Drawing card */}
          <CreateDrawingButton asCard />
        </div>
      )}
    </div>
  );
}
