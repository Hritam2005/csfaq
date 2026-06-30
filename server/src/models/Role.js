import mongoose from 'mongoose';
import './Permission.js';

const roleSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    description: {
      type: String,
      trim: true,
    },
    permissions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Permission',
      },
    ],
    isSystem: {
      type: Boolean,
      default: false,
      description: 'System roles (like Super Admin) cannot be deleted or heavily modified',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Populate permissions automatically when querying roles
roleSchema.pre(/^find/, async function () {
  this.populate({
    path: 'permissions',
    select: 'name module',
  });
});

const Role = mongoose.model('Role', roleSchema);
export default Role;
