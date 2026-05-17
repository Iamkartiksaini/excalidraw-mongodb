"use server";

import connectToDatabase from "@/lib/db";
import Note from "@/models/Note";
import NoteFolder from "@/models/NoteFolder";
import { auth, currentUser } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { nanoid } from "nanoid";

/**
 * Updates the visibility of a note or folder.
 * Matches isPublic to true if visibility is set to public.
 */
export async function updateVisibility(
  id: string,
  type: "note" | "folder",
  visibility: "private" | "public" | "restricted"
) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  await connectToDatabase();

  if (type === "note") {
    const isPublic = visibility === "public";
    const existing = await Note.findOne({ _id: id, userId });
    if (!existing) throw new Error("Note not found or unauthorized");

    let note;
    if (visibility === "private") {
      note = await Note.findOneAndUpdate(
        { _id: id, userId },
        { $set: { visibility, isPublic: false }, $unset: { shareId: "" } },
        { new: true }
      );
    } else {
      const shareId = nanoid(10);
      note = await Note.findOneAndUpdate(
        { _id: id, userId },
        { $set: { visibility, isPublic, shareId } },
        { new: true }
      );
    }
    if (!note) throw new Error("Note not found or unauthorized");

    revalidatePath(`/notes/${id}`, "page");
    revalidatePath("/dashboard", "page");
    return JSON.parse(JSON.stringify(note));
  } else {
    const existing = await NoteFolder.findOne({ _id: id, userId });
    if (!existing) throw new Error("Folder not found or unauthorized");

    let folder;
    if (visibility === "private") {
      folder = await NoteFolder.findOneAndUpdate(
        { _id: id, userId },
        { $set: { visibility }, $unset: { shareId: "" } },
        { new: true }
      );
    } else {
      const shareId = nanoid(10);
      folder = await NoteFolder.findOneAndUpdate(
        { _id: id, userId },
        { $set: { visibility, shareId } },
        { new: true }
      );
    }
    if (!folder) throw new Error("Folder not found or unauthorized");

    revalidatePath("/dashboard", "page");
    return JSON.parse(JSON.stringify(folder));
  }
}

/**
 * Adds an email address to the list of invited emails for a note or folder.
 */
export async function inviteEmail(
  id: string,
  type: "note" | "folder",
  email: string
) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const trimmedEmail = email.trim().toLowerCase();
  if (!trimmedEmail) throw new Error("Email is required");

  await connectToDatabase();

  if (type === "note") {
    const note = await Note.findOne({ _id: id, userId });
    if (!note) throw new Error("Note not found or unauthorized");

    if (!note.invitedEmails.includes(trimmedEmail)) {
      note.invitedEmails.push(trimmedEmail);
      await note.save();
    }

    revalidatePath(`/notes/${id}`, "page");
    revalidatePath("/dashboard", "page");
    return JSON.parse(JSON.stringify(note));
  } else {
    const folder = await NoteFolder.findOne({ _id: id, userId });
    if (!folder) throw new Error("Folder not found or unauthorized");

    if (!folder.invitedEmails.includes(trimmedEmail)) {
      folder.invitedEmails.push(trimmedEmail);
      await folder.save();
    }

    revalidatePath("/dashboard", "page");
    return JSON.parse(JSON.stringify(folder));
  }
}

/**
 * Removes an email address from the list of invited emails for a note or folder.
 */
export async function removeEmail(
  id: string,
  type: "note" | "folder",
  email: string
) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const trimmedEmail = email.trim().toLowerCase();

  await connectToDatabase();

  if (type === "note") {
    const note = await Note.findOne({ _id: id, userId });
    if (!note) throw new Error("Note not found or unauthorized");

    note.invitedEmails = note.invitedEmails.filter(
      (e: string) => e.toLowerCase() !== trimmedEmail
    );
    await note.save();

    revalidatePath(`/notes/${id}`, "page");
    revalidatePath("/dashboard", "page");
    return JSON.parse(JSON.stringify(note));
  } else {
    const folder = await NoteFolder.findOne({ _id: id, userId });
    if (!folder) throw new Error("Folder not found or unauthorized");

    folder.invitedEmails = folder.invitedEmails.filter(
      (e: string) => e.toLowerCase() !== trimmedEmail
    );
    await folder.save();

    revalidatePath("/dashboard", "page");
    return JSON.parse(JSON.stringify(folder));
  }
}

/**
 * Retrieves folders and notes shared with the current authenticated user's email,
 * or public notes/folders saved by this user, strictly excluding any that are private.
 */
export async function getSharedWithMeNotes() {
  const user = await currentUser();
  const email = user?.emailAddresses?.[0]?.emailAddress?.toLowerCase();
  const userId = user?.id;
  if (!email && !userId) return { notes: [], folders: [] };

  await connectToDatabase();

  const folderQuery: any = { $or: [] };
  if (email) {
    folderQuery.$or.push({ invitedEmails: email, visibility: "restricted" });
  }
  if (userId) {
    folderQuery.$or.push({ savedBy: userId, visibility: { $ne: "private" } });
  }

  const noteQuery: any = { $or: [] };
  if (email) {
    noteQuery.$or.push({ invitedEmails: email, visibility: "restricted" });
  }
  if (userId) {
    noteQuery.$or.push({ savedBy: userId, visibility: { $ne: "private" } });
  }

  const folders = folderQuery.$or.length > 0
    ? await NoteFolder.find(folderQuery).sort({ updatedAt: -1 })
    : [];

  const notes = noteQuery.$or.length > 0
    ? await Note.find(noteQuery).sort({ updatedAt: -1 })
    : [];

  return {
    notes: JSON.parse(JSON.stringify(notes)),
    folders: JSON.parse(JSON.stringify(folders))
  };
}

/**
 * Toggles a user's ID in the savedBy array of a note or folder.
 */
export async function toggleSavedPublicLink(
  id: string,
  type: "note" | "folder"
) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  await connectToDatabase();

  if (type === "note") {
    const note = await Note.findById(id);
    if (!note) throw new Error("Note not found");

    const index = note.savedBy.indexOf(userId);
    let saved = false;
    if (index === -1) {
      note.savedBy.push(userId);
      saved = true;
    } else {
      note.savedBy.splice(index, 1);
      saved = false;
    }
    await note.save();

    revalidatePath(`/notes/${id}`, "page");
    revalidatePath("/dashboard", "page");
    if (note.shareId) {
      revalidatePath(`/share/note/${note.shareId}`, "page");
    }
    return { saved };
  } else {
    const folder = await NoteFolder.findById(id);
    if (!folder) throw new Error("Folder not found");

    const index = folder.savedBy.indexOf(userId);
    let saved = false;
    if (index === -1) {
      folder.savedBy.push(userId);
      saved = true;
    } else {
      folder.savedBy.splice(index, 1);
      saved = false;
    }
    await folder.save();

    revalidatePath("/dashboard", "page");
    return { saved };
  }
}

/**
 * Forces a regeneration of the shareId for a note or folder, permanently breaking old links.
 */
export async function regenerateShareId(
  id: string,
  type: "note" | "folder"
) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  await connectToDatabase();
  const newShareId = nanoid(10);

  if (type === "note") {
    const note = await Note.findOneAndUpdate(
      { _id: id, userId },
      { $set: { shareId: newShareId } },
      { new: true }
    );
    if (!note) throw new Error("Note not found or unauthorized");

    revalidatePath(`/notes/${id}`, "page");
    revalidatePath("/dashboard", "page");
    if (note.shareId) {
      revalidatePath(`/share/note/${note.shareId}`, "page");
    }
    return { shareId: newShareId };
  } else {
    const folder = await NoteFolder.findOneAndUpdate(
      { _id: id, userId },
      { $set: { shareId: newShareId } },
      { new: true }
    );
    if (!folder) throw new Error("Folder not found or unauthorized");

    revalidatePath("/dashboard", "page");
    return { shareId: newShareId };
  }
}

