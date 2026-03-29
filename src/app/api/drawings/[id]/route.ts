import { NextResponse } from "next/server";
import { getDrawingById, updateDrawing, deleteDrawing } from "@/actions/drawingActions";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const drawing = await getDrawingById(params.id);
    return NextResponse.json(drawing);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: error.message === "Unauthorized" ? 401 : 500 });
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const data = await req.json();
    const drawing = await updateDrawing(params.id, data);
    return NextResponse.json(drawing);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: error.message === "Unauthorized" ? 401 : 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const result = await deleteDrawing(params.id);
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: error.message === "Unauthorized" ? 401 : 500 });
  }
}
