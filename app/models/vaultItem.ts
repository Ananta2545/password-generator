import mongoose from 'mongoose';
const vaultItemSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    encryptedData: {
      type: String,
      required: true,
    },
    tags: {
      type: [String],
      default: [],
    },
    lastModified: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);
vaultItemSchema.index({ userId: 1, createdAt: -1 });
vaultItemSchema.index({ userId: 1, tags: 1 });
const VaultItem =
  mongoose.models.VaultItem || mongoose.model('VaultItem', vaultItemSchema);
export default VaultItem;