import mongoose, { Schema, model, models } from "mongoose";

const NoteFolderSchema = new Schema(
  {
    title: { type: String, required: true, default: "Untitled Folder" },
    userId: { type: String, required: true, index: true },
    visibility: {
      type: String,
      enum: ["private", "public", "restricted"],
      default: "private",
    },
    invitedEmails: { type: [String], default: [] },
    savedBy: { type: [String], default: [] },
    shareId: { type: String, unique: true, sparse: true },
  },
  { timestamps: true }
);

const NoteFolder = models.NoteFolder || model("NoteFolder", NoteFolderSchema);

export default NoteFolder;
