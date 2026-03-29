import mongoose, { Schema, model, models } from "mongoose";

const DrawingSchema = new Schema(
  {
    title: { type: String, required: true, default: "Untitled Drawing" },
    userId: { type: String, required: true, index: true },
    elements: { type: Array, required: true, default: [] },
    appState: { type: Object, required: true, default: {} },
    version: { type: Number, required: true, default: 1 },
    versions: [
      {
        elements: { type: Array, required: true },
        appState: { type: Object, required: true },
        version: { type: Number, required: true },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    isPublic: { type: Boolean, default: false },
    shareId: { type: String, unique: true, sparse: true },
  },
  { timestamps: true }
);

const Drawing = models.Drawing || model("Drawing", DrawingSchema);

export default Drawing;
