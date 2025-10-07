import mongoose from 'mongoose';

const vaultItemSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    // Encrypted JSON string containing: title, username, password, url, notes
    encryptedData: {
      type: String,
      required: true,
    },
    // Optional tags for categorization
    tags: {
      type: [String],
      default: [],
    },
    // Track when item was last modified
    lastModified: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt
  }
);

// Create compound index for faster user-specific queries
vaultItemSchema.index({ userId: 1, createdAt: -1 });
vaultItemSchema.index({ userId: 1, tags: 1 });

const VaultItem =
  mongoose.models.VaultItem || mongoose.model('VaultItem', vaultItemSchema);

export default VaultItem;