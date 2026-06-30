import mongoose from 'mongoose';
import slugify from 'slugify';

const tagSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    slug: {
      type: String,
      unique: true,
      index: true,
    },
    color: {
      type: String,
      default: '#e0e0e0',
    },
    popularity: {
      type: Number,
      default: 0, // Incremented when used in search or tagged to a doc
      index: -1,
    },
    synonyms: [
      {
        type: String,
        trim: true,
        lowercase: true,
      },
    ],
    aliases: [
      {
        type: String,
        trim: true,
        lowercase: true,
      },
    ],
    relationships: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tag',
      },
    ],
  },
  { timestamps: true }
);

// Text index for finding tags by name, synonym, or alias
tagSchema.index({ name: 'text', synonyms: 'text', aliases: 'text' });

tagSchema.pre('save', function () {
  if (this.isModified('name')) {
    this.slug = slugify(this.name, { lower: true, strict: true });
  }
  });

const Tag = mongoose.model('Tag', tagSchema);
export default Tag;
