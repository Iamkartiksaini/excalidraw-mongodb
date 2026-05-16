import mongoose, { Schema, model, models } from "mongoose";

const NoteSchema = new Schema(
  {
    title: { type: String, required: true, default: "Untitled Note" },
    content: { type: String, required: false, default: "" },
    userId: { type: String, required: true, index: true },
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
