import mongoose from "mongoose";

const fileSchema = new mongoose.Schema(
  {
    originalName: { type: String, required: true },
    safeName: { type: String, required: true },
    size: { type: Number, required: true },
    hash: { type: String, required: true, index: true },
    mimetype: { type: String, required: true },
    uploadedAt: { type: Date, default: Date.now },
    uploadedBy: { type: String, default: "demo-user" },

    status: {
      type: String,
      enum: ["uploaded", "analyzing", "completed", "failed"],
      default: "uploaded",
    },

    staticAnalysis: {
      entropy: { type: Number, default: null },
      strings: [{ type: String }],
      iocs: [{ type: String }],
      yaraMatches: [{ type: String }],
      peMetadata: { type: mongoose.Schema.Types.Mixed, default: null },
      analysisDate: { type: Date, default: null },
      errors: [{ type: String }],
    },
    threatIntel: {
      vtReport: { type: mongoose.Schema.Types.Mixed, default: null },
      vtScore: { type: Number, default: null }, // malicious/total engines
      vtDetections: [{ type: String }], // engine names that flagged it
      abuseCHMatches: [{ type: String }],
      otxMatches: [{ type: String }],
      analysisDate: { type: Date, default: null },
      errors: [{ type: String }],
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: function (doc, ret) {
        if (ret.staticAnalysis?.strings?.length > 100) {
          ret.staticAnalysis.strings = ret.staticAnalysis.strings.slice(0, 100);
          ret.staticAnalysis.stringsCount = doc.staticAnalysis.strings.length;
        }
        return ret;
      },  
    },
  }
);

fileSchema.index({ hash: 1, uploadedBy: 1 }, { unique: true });
fileSchema.index({ uploadedAt: -1 });
fileSchema.index({ "staticAnalysis.analysisDate": -1 });

export default mongoose.model("File", fileSchema);
