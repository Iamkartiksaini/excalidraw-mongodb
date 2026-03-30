import { NextResponse } from "next/server";
import { getPublicDrawing } from "@/actions/drawingActions";

export async function GET(req: Request, { params }: { params: Promise<{ shareId: string }> }) {
  try {
    const { shareId } = await params;
    const drawing = await getPublicDrawing(shareId);
    return NextResponse.json(drawing);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 404 });
  }
}
