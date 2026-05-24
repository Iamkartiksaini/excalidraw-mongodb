"use server";

import connectToDatabase from "@/lib/db";
import Note from "@/models/Note";
import { auth, currentUser, clerkClient } from "@clerk/nextjs/server";
import { nanoid } from "nanoid";
import { revalidatePath } from "next/cache";

// --- Types ---

export interface NoteData {
  title: string;
  content: string;
}

// --- Actions ---

export async function createNote(title: string = "Untitled Note") {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  await connectToDatabase();

  const note = await Note.create({
    userId,
    title,
    content: "",
    visibility: "private",
    invitedEmails: [],
    isPublic: false,
    shareId: nanoid(10),
  });

  return JSON.parse(JSON.stringify(note));
}

export async function getUserNotes() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  await connectToDatabase();
  const notes = await Note.find({ userId }).sort({ updatedAt: -1 });

  return JSON.parse(JSON.stringify(notes));
}

export async function getNoteById(id: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  await connectToDatabase();
  const note = await Note.findById(id);

  if (!note) throw new Error("Note not found");

  // Strictly enforce that only the creator/owner can access the editor route's data
  if (note.userId !== userId) {
    throw new Error("Unauthorized");
  }

  return JSON.parse(JSON.stringify(note));
}

export async function updateNote(
  id: string,
  data: { title?: string; content?: string }
) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  await connectToDatabase();
  const note = await Note.findOne({ _id: id, userId });

  if (!note) throw new Error("Note not found or unauthorized");

  if (data.title !== undefined) note.title = data.title;
  if (data.content !== undefined) note.content = data.content;

  await note.save();

  revalidatePath(`/notes/${id}`, "page");
  revalidatePath("/dashboard", "page");

  return JSON.parse(JSON.stringify(note));
}

export async function deleteNote(id: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  await connectToDatabase();
  const result = await Note.deleteOne({ _id: id, userId });

  if (result.deletedCount === 0) throw new Error("Note not found or unauthorized");

  revalidatePath("/dashboard", "page");
  return { success: true };
}

export async function toggleNotePublic(id: string, isPublic: boolean) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  await connectToDatabase();
  const note = await Note.findOneAndUpdate(
    { _id: id, userId },
    { isPublic, visibility: isPublic ? "public" : "private" },
    { new: true }
  );

  if (!note) throw new Error("Note not found");

  revalidatePath(`/notes/${id}`, "page");
  return JSON.parse(JSON.stringify(note));
}

export async function getPublicNote(shareId: string) {
  await connectToDatabase();
  const note = await Note.findOne({ shareId });

  if (!note) throw new Error("Note not found: it either does not exist, was deleted, or its visibility has changed.");

  const { userId } = await auth();

  // Owner always has access
  if (userId && note.userId === userId) {
    return JSON.parse(JSON.stringify(note));
  }

  // If note belongs to a folder, enforce folder's access rules strictly overriding note settings
  if (note.folderId) {
    const NoteFolder = (await import("@/models/NoteFolder")).default;
    const folder = await NoteFolder.findById(note.folderId);
    if (!folder) throw new Error("Folder not found");

    if (userId && folder.userId === userId) {
      return JSON.parse(JSON.stringify(note));
    }

    if (folder.visibility === "private") {
      throw new Error("Unauthorized");
    }

    if (folder.visibility === "restricted") {
      const user = await currentUser();
      const email = user?.emailAddresses?.[0]?.emailAddress;
      if (!email || !folder.invitedEmails.includes(email)) {
        throw new Error("Unauthorized");
      }
      if (userId && note.userId !== userId) {
        await Note.findByIdAndUpdate(note._id, { $addToSet: { savedBy: userId } });
      }
      return JSON.parse(JSON.stringify(note));
    }

    if (folder.visibility === "public") {
      if (userId && note.userId !== userId) {
        await Note.findByIdAndUpdate(note._id, { $addToSet: { savedBy: userId } });
      }
      return JSON.parse(JSON.stringify(note));
    }

    throw new Error("Unauthorized");
  }

  // No folder, fallback to note-level visibility
  if (note.visibility === "private" || (!note.visibility && !note.isPublic)) {
    throw new Error("Unauthorized");
  }

  if (note.visibility === "restricted") {
    const user = await currentUser();
    const email = user?.emailAddresses?.[0]?.emailAddress;
    if (!email || !note.invitedEmails.includes(email)) {
      throw new Error("Unauthorized");
    }
    if (userId && note.userId !== userId) {
      await Note.findByIdAndUpdate(note._id, { $addToSet: { savedBy: userId } });
    }
    return JSON.parse(JSON.stringify(note));
  }

  if (note.visibility === "public" || note.isPublic) {
    if (userId && note.userId !== userId) {
      await Note.findByIdAndUpdate(note._id, { $addToSet: { savedBy: userId } });
    }
    return JSON.parse(JSON.stringify(note));
  }

  throw new Error("Unauthorized");
}

export async function migrateLocalNote(data: NoteData) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const { title, content } = data;

  await connectToDatabase();
  const note = await Note.create({
    userId,
    title,
    content,
    visibility: "private",
    invitedEmails: [],
    isPublic: false,
    shareId: nanoid(10),
  });

  revalidatePath("/dashboard", "page");

  return JSON.parse(JSON.stringify(note));
}

export async function cloneNote(noteId: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  await connectToDatabase();
  const sourceNote = await Note.findOne({ _id: noteId, userId });
  if (!sourceNote) throw new Error("Note not found or unauthorized");

  const newNote = await Note.create({
    userId,
    title: `${sourceNote.title || "Untitled"} (Copy)`,
    content: sourceNote.content,
    visibility: "private",
    invitedEmails: [],
    isPublic: false,
    shareId: nanoid(10),
    // folderId is omitted, detaching it from the folder
  });

  revalidatePath("/dashboard", "page");

  return JSON.parse(JSON.stringify(newNote));
}

export async function getUserNotesPreview() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  await connectToDatabase();
  // Project only essential preview fields to optimize database/network performance
  const notes = await Note.find(
    { userId },
    { title: 1, content: 1, visibility: 1, isPublic: 1, updatedAt: 1, shareId: 1, folderId: 1 }
  ).sort({ updatedAt: -1 });

  // Process notes: strip markdown syntax and truncate content to max 100 characters
  const processedNotes = notes.map((note) => {
    const rawContent = note.content || "";
    
    // Strip headers, bold, italics, links, backticks, strikethrough markdown
    const strippedContent = rawContent
      .replace(/#{1,6}\s/g, "")
      .replace(/\*\*|__|\*|_|~~|`{1,3}/g, "")
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1");
    
    // Slice to max 100 characters
    const previewContent = strippedContent.slice(0, 100);

    const noteObj = JSON.parse(JSON.stringify(note));
    noteObj.content = previewContent;
    return noteObj;
  });

  return processedNotes;
}

export async function clonePublicNoteToCloud(noteId: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  await connectToDatabase();
  const sourceNote = await Note.findById(noteId);
  if (!sourceNote) throw new Error("Note not found");

  // Strictly check that the note's visibility is public, or isPublic is true, or it belongs to a public folder
  let isPubliclyClonable = sourceNote.visibility === "public" || sourceNote.isPublic;

  if (!isPubliclyClonable && sourceNote.folderId) {
    const NoteFolder = (await import("@/models/NoteFolder")).default;
    const folder = await NoteFolder.findById(sourceNote.folderId);
    if (folder && folder.visibility === "public") {
      isPubliclyClonable = true;
    }
  }

  if (!isPubliclyClonable) {
    throw new Error("Unauthorized: This note is not publicly clonable");
  }

  const newNote = await Note.create({
    userId,
    title: `${sourceNote.title || "Untitled"} (Clone)`,
    content: sourceNote.content,
    visibility: "private",
    invitedEmails: [],
    isPublic: false,
    shareId: nanoid(10),
  });

  revalidatePath("/dashboard", "page");

  return JSON.parse(JSON.stringify(newNote));
}

export async function searchProfiles(query: string) {
  const client = await clerkClient();
  const response = await client.users.getUserList({ query });
  const users = Array.isArray(response) ? response : (response.data || []);

  const filtered = users
    .filter((user) => !!user.username)
    .map((user) => ({
      id: user.id,
      username: user.username,
      imageUrl: user.imageUrl,
    }));

  return filtered;
}

export async function getProfileByUsername(username: string) {
  const client = await clerkClient();
  const response = await client.users.getUserList({ username: [username], limit: 1 });
  const users = Array.isArray(response) ? response : (response.data || []);

  if (users.length === 0) {
    return null;
  }

  const user = users[0];
  if (!user.username) return null;

  return {
    id: user.id,
    username: user.username,
    imageUrl: user.imageUrl,
  };
}

export async function getPublicNotesByUserId(profileUserId: string) {
  await connectToDatabase();

  const NoteFolder = (await import("@/models/NoteFolder")).default;
  const publicFolders = await NoteFolder.find({
    userId: profileUserId,
    visibility: "public",
  }).select("_id");

  const publicFolderIds = publicFolders.map((f) => f._id);

  // Fetch up to 10 notes
  const notes = await Note.find({
    userId: profileUserId,
    $or: [
      { folderId: { $exists: false }, visibility: "public" },
      { folderId: null, visibility: "public" },
      { folderId: { $in: publicFolderIds } },
    ],
  })
    .sort({ updatedAt: -1 })
    .limit(10);

  const processedNotes = notes.map((note) => {
    const rawContent = note.content || "";
    
    // Strip headers, bold, italics, links, backticks, strikethrough markdown
    const strippedContent = rawContent
      .replace(/#{1,6}\s/g, "")
      .replace(/\*\*|__|\*|_|~~|`{1,3}/g, "")
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1");
    
    // Slice to max 100 characters
    const previewContent = strippedContent.slice(0, 100);

    const noteObj = JSON.parse(JSON.stringify(note));
    noteObj.content = previewContent;
    return noteObj;
  });

  return processedNotes;
}

