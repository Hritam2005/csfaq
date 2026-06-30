import mongoose from 'mongoose';

const permissionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
      description: 'The unique identifier for the permission (e.g., faq.create)',
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    module: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      index: true,
      description: 'The module this permission belongs to (e.g., faq, users)',
    },
    isSystem: {
      type: Boolean,
      default: false,
      description: 'If true, this permission cannot be deleted',
    },
  },
  {
    timestamps: true,
  }
);

const Permission = mongoose.model('Permission', permissionSchema);
export default Permission;
