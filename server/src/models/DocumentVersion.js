import mongoose from 'mongoose';

const documentVersionSchema = new mongoose.Schema(
  {
    document: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'KnowledgeDocument',
      required: true,
      index: true,
    },
    versionNumber: {
      type: Number,
      required: true,
    },
    checksum: {
      type: String,
      required: true,
    },
    storagePath: {
      type: String,
      required: true,
    },
    changeSummary: {
      type: String,
      trim: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

documentVersionSchema.index({ document: 1, versionNumber: 1 }, { unique: true });

const DocumentVersion = mongoose.model('DocumentVersion', documentVersionSchema);
export default DocumentVersion;
