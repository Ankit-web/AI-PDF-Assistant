import mongoose from 'mongoose';

const embeddingSchema = new mongoose.Schema({
  chunk: { type: String, required: true },
  vector: { type: [Number], required: true },
}, { _id: false });

const documentSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Document title is required'],
      trim: true,
    },
    originalContent: {
      type: String,
      required: true,
    },
    summary: {
      type: String,
      default: '',
    },
    embeddings: {
      type: [embeddingSchema],
      default: [],
    },
    chatMessageCount: {
        type: Number,
        default: 0,
    },
    // --- NEW FIELD ---
    fileBuffer: {
        type: Buffer, // Store the raw file data
        required: true,
    },
    // -----------------
    status: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed'],
      default: 'pending',
    },
    sourceType: {
      type: String,
      enum: ['pdf', 'url'],
      required: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Document = mongoose.model('Document', documentSchema);

export default Document;
