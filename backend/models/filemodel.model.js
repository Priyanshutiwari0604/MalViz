import mongoose from "mongoose";

const fileSchema = new mongoose.Schema({
  originalName: { type: String, required: true },
  safeName: { type: String, required: true },
  size: { type: Number, required: true },
  hash: { type: String, required: true, index: true },
  mimetype: { type: String, required: true },
  uploadedAt: { type: Date, default: Date.now },
  uploadedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }] // 👈 track who uploaded
});

fileSchema.index({ hash: 1 }); // ensure fast lookup by hash

export default mongoose.model("File", fileSchema);
