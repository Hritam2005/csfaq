import mongoose from 'mongoose';

const QuerySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    question: {
      type: String,
      required: [true, 'Please provide the question'],
      trim: true,
      maxlength: [1000, 'Question cannot exceed 1000 characters'],
    },
    status: {
      type: String,
      enum: ['Pending', 'Resolved', 'Dismissed'],
      default: 'Pending',
    },
    response: {
      type: String,
      default: '',
    },
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High'],
      default: 'Low',
    }
  },
  { timestamps: true }
);

export default mongoose.model('Query', QuerySchema);
