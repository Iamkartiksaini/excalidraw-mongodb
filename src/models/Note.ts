import mongoose, { Schema, model, models } from "mongoose";

const NoteSchema = new Schema(
  {
    title: { type: String, required: true, default: "Untitled Note" },
    content: { type: String, required: false, default: "" },
    userId: { type: String, required: true, index: true },
    visibility: { type: String, enum: ["private", "public", "restricted"], default: "private" },
    invitedEmails: { type: [String], default: [] },
    savedBy: { type: [String], default: [] },
    folderId: { type: Schema.Types.ObjectId, ref: "NoteFolder", required: false },
    isPublic: { type: Boolean, default: false },
    shareId: { type: String, unique: true, sparse: true },
  },
  { timestamps: true }
);

// // Force schema recreation during HMR
// if (process.env.NODE_ENV === "development") {
//   delete mongoose.models.Note;
// }

const Note = models.Note || model("Note", NoteSchema);

export default Note;
