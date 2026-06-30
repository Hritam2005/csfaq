import mongoose from 'mongoose';

const deviceSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    deviceId: {
      type: String,
      required: true,
      index: true,
    },
    deviceName: {
      type: String,
      default: 'Unknown Device', // e.g., "MacBook Pro", "iPhone 13"
    },
    browser: {
      type: String,
      default: 'Unknown',
    },
    os: {
      type: String,
      default: 'Unknown',
    },
    ipAddress: {
      type: String,
      default: 'Unknown',
    },
    location: {
      type: String,
      default: 'Unknown Location', // Placeholder for IP based geolocation
    },
    isTrusted: {
      type: Boolean,
      default: false,
    },
    lastActive: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Ensure a user only has one active record per physical device fingerprint
deviceSchema.index({ user: 1, deviceId: 1 }, { unique: true });

const Device = mongoose.model('Device', deviceSchema);
export default Device;
