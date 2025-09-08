// import mongoose from "mongoose";

// const fileSchema = new mongoose.Schema(
//   {
//     originalName: { type: String, required: true }, // user-provided name
//     safeName: { type: String, required: true },     // stored filename on disk
//     size: { type: Number, required: true },         // file size in bytes
//     hash: { type: String, required: true, unique: true, index: true }, // SHA-256 hash
//     mimetype: { type: String, required: true },     // MIME type (image/png, etc.)
//     uploadedAt: { type: Date, default: Date.now },  // timestamp
//     uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // single uploader
//     staticAnalysis: {entropy: Number,strings: [String],iocs: [String],yaraMatches: [String],peMetadata: Object,},
//   },
//   { timestamps: true } // adds createdAt & updatedAt automatically
// );

// // ✅ Compound index for better deduplication checks
// fileSchema.index({ hash: 1, uploadedBy: 1 }, { unique: true });

// export default mongoose.model("File", fileSchema);


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
      default: "uploaded" 
    },

    staticAnalysis: {
      entropy: { type: Number, default: null },
      strings: [{ type: String }],
      iocs: [{ type: String }],
      yaraMatches: [{ type: String }],
      peMetadata: { type: mongoose.Schema.Types.Mixed, default: null },
      analysisDate: { type: Date, default: null },
      errors: [{ type: String }]
    }
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
      }
    }
  }
);

// Indexes
fileSchema.index({ hash: 1, uploadedBy: 1 }, { unique: true });
fileSchema.index({ uploadedAt: -1 });
fileSchema.index({ "staticAnalysis.analysisDate": -1 });

export default mongoose.model("File", fileSchema);
