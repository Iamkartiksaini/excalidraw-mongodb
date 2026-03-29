import { NextResponse } from "next/server";
import { getPublicDrawing } from "@/actions/drawingActions";

export async function GET(req: Request, { params }: { params: { shareId: string } }) {
  try {
    const drawing = await getPublicDrawing(params.shareId);
    return NextResponse.json(drawing);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 404 });
  }
}
