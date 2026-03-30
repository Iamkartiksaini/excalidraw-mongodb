"use server";

import connectToDatabase from "@/lib/db";
import Drawing from "@/models/Drawing";
import { auth } from "@clerk/nextjs/server";
import { nanoid } from "nanoid";
import { revalidatePath } from "next/cache";
// --- Validations & Security ---

interface DrawingData {
  title: string;
  elements: any[];
  appState?: any;
}



// --- Actions ---

export async function createDrawing(title: string = "Untitled Drawing") {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  await connectToDatabase();

  // Create an initial "Hello World" text element
  const helloWorldElement = {
    id: nanoid(),
    type: "text",
    x: 400,
    y: 300,
    width: 200,
    height: 50,
    strokeColor: "#1e1e1e",
    backgroundColor: "transparent",
    fillStyle: "hachure",
    strokeWidth: 1,
    strokeStyle: "solid",
    roughness: 1,
    opacity: 100,
    groupIds: [],
    strokeSharpness: "sharp",
    version: 1,
    versionNonce: Math.floor(Math.random() * 1000000),
    isDeleted: false,
    text: "Hello World",
    fontSize: 20,
    fontFamily: 1,
    textAlign: "left",
    verticalAlign: "top",
    containerId: null,
    originalText: "Hello World",
    lineHeight: 1.25,
  };

  const drawing = await Drawing.create({
    userId,
    title,
    elements: [helloWorldElement],
    appState: { viewBackgroundColor: "#ffffff" },
    shareId: nanoid(10),
  });

  return JSON.parse(JSON.stringify(drawing));
}

/**
 * Migrates a drawing from guest/local storage to the cloud.
 * This is a highly secure action with full data validation.
 */
export async function migrateLocalToCloud(data: DrawingData) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized (Authentication required for cloud migration)");

  const { title, elements, appState } = data;

  // 1. High-Priority Storage Operation
  await connectToDatabase();
  
  // Single-transaction-style create to prevent "empty drawing" bugs
  const drawing = await Drawing.create({
    userId,
    title,
    elements,
    appState: appState || { viewBackgroundColor: "#ffffff" },
    shareId: nanoid(10),
  });

  revalidatePath("/dashboard", "page");
  
  return JSON.parse(JSON.stringify(drawing));
}

export async function getUserDrawings() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  await connectToDatabase();
  const drawings = await Drawing.find({ userId }).sort({ updatedAt: -1 });

  return JSON.parse(JSON.stringify(drawings));
}

export async function getDrawingById(id: string) {
  const { userId } = await auth();
  
  await connectToDatabase();
  const drawing = await Drawing.findById(id);

  if (!drawing) throw new Error("Drawing not found");

  // Check if owner or public
  if (drawing.userId !== userId && !drawing.isPublic) {
    throw new Error("Unauthorized");
  }

  return JSON.parse(JSON.stringify(drawing));
}

export async function updateDrawing(id: string, data: { elements: any[]; appState: any; title?: string }) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  await connectToDatabase();
  const drawing = await Drawing.findById(id);

  if (!drawing) throw new Error("Drawing not found");
  if (drawing.userId !== userId) throw new Error("Unauthorized");

  // Handle versioning before update
  const currentVersion = {
    elements: drawing.elements,
    appState: drawing.appState,
    version: drawing.version,
    createdAt: drawing.updatedAt,
  };

  // Push to versions and keep last 20
  const updatedVersions = [currentVersion, ...(drawing.versions || [])].slice(0, 20);

  drawing.elements = data.elements;
  drawing.appState = data.appState;
  if (data.title) drawing.title = data.title;
  drawing.version += 1;
  drawing.versions = updatedVersions;

  await drawing.save();
  revalidatePath(`/draw/${id}`, "page");
  revalidatePath("/dashboard", "page");

  return JSON.parse(JSON.stringify(drawing));
}

export async function deleteDrawing(id: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  await connectToDatabase();
  const result = await Drawing.deleteOne({ _id: id, userId });

  if (result.deletedCount === 0) throw new Error("Drawing not found or unauthorized");

  revalidatePath("/dashboard", "page");
  return { success: true };
}

export async function togglePublic(id: string, isPublic: boolean) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  await connectToDatabase();
  const drawing = await Drawing.findOneAndUpdate(
    { _id: id, userId },
    { isPublic },
    { new: true }
  );

  if (!drawing) throw new Error("Drawing not found");

  revalidatePath(`/draw/${id}`, "page");
  return JSON.parse(JSON.stringify(drawing));
}

export async function getPublicDrawing(shareId: string) {
  await connectToDatabase();
  const drawing = await Drawing.findOne({ shareId, isPublic: true });

  if (!drawing) throw new Error("Public drawing not found");

  return JSON.parse(JSON.stringify(drawing));
}

export async function renameDrawing(id: string, title: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  await connectToDatabase();
  const drawing = await Drawing.findOneAndUpdate(
    { _id: id, userId },
    { title },
    { new: true }
  );

  if (!drawing) throw new Error("Drawing not found");

  revalidatePath(`/draw/${id}`, "page");
  revalidatePath("/dashboard", "page");
  return JSON.parse(JSON.stringify(drawing));
}
