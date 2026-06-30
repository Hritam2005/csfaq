import mongoose from 'mongoose';
import { RELATIONSHIP_TYPES } from '../constants/knowledge.constants.js';

const knowledgeRelationshipSchema = new mongoose.Schema(
  {
    sourceModel: {
      type: String,
      required: true,
      enum: ['FAQ', 'KnowledgeDocument', 'Category', 'Tag'],
      index: true,
    },
    sourceId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    targetModel: {
      type: String,
      required: true,
      enum: ['FAQ', 'KnowledgeDocument', 'Category', 'Tag'],
    },
    targetId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    relationshipType: {
      type: String,
      enum: Object.values(RELATIONSHIP_TYPES),
      required: true,
      index: true,
    },
    weight: {
      type: Number,
      default: 1.0, // Used for Graph weighting (0.0 to 1.0)
    },
    metadata: {
      type: Map,
      of: String,
    },
  },
  { timestamps: true }
);

// Prevent duplicate relationships
knowledgeRelationshipSchema.index(
  { sourceId: 1, targetId: 1, relationshipType: 1 },
  { unique: true }
);

const KnowledgeRelationship = mongoose.model('KnowledgeRelationship', knowledgeRelationshipSchema);
export default KnowledgeRelationship;
