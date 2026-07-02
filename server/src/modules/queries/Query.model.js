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
    isCritical: {
      type: Boolean,
      default: false,
    }
  },
  { timestamps: true }
);

QuerySchema.pre('save', function (next) {
  if (this.isModified('question')) {
    const criticalKeywords = [
      'fail', 'broken', 'error', 'crash', 'down', 'payment', 
      'leak', 'hacked', 'security', 'urgent', 'emergency', 
      'blocker', 'login', 'unable'
    ];
    const questionLower = this.question.toLowerCase();
    this.isCritical = criticalKeywords.some(keyword => questionLower.includes(keyword));
  }
  next();
});

export default mongoose.model('Query', QuerySchema);

