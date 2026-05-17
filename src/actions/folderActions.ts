"use server";

import connectToDatabase from "@/lib/db";
import NoteFolder from "@/models/NoteFolder";
import { auth } from "@clerk/nextjs/server";
import { nanoid } from "nanoid";
import { revalidatePath } from "next/cache";

export async function createFolder(title: string = "New Folder") {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  await connectToDatabase();

  const folder = await NoteFolder.create({
    userId,
    title,
    visibility: "private",
    invitedEmails: [],
    savedBy: [],
    shareId: nanoid(10),
  });

  revalidatePath("/dashboard", "page");

  return JSON.parse(JSON.stringify(folder));
}

export async function getUserFolders() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  await connectToDatabase();
  const folders = await NoteFolder.find({ userId }).sort({ updatedAt: -1 });

  return JSON.parse(JSON.stringify(folders));
}

export async function deleteFolder(id: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  await connectToDatabase();
  const result = await NoteFolder.deleteOne({ _id: id, userId });

  if (result.deletedCount === 0) throw new Error("Folder not found or unauthorized");

  revalidatePath("/dashboard", "page");
  return { success: true };
}

export async function updateFolder(
  id: string,
  data: { title?: string }
) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  await connectToDatabase();
  const folder = await NoteFolder.findOne({ _id: id, userId });

  if (!folder) throw new Error("Folder not found or unauthorized");

  if (data.title !== undefined) folder.title = data.title;

  await folder.save();

  revalidatePath("/dashboard", "page");

  return JSON.parse(JSON.stringify(folder));
}
