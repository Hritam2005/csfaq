import KnowledgeRelationship from '../../../models/KnowledgeRelationship.js';
import { RELATIONSHIP_TYPES } from '../../../constants/knowledge.constants.js';
import { KnowledgeError, ERROR_CODES } from '../Knowledge.errors.js';

export class KnowledgeGraph {
  /**
   * Connects two nodes in the knowledge graph.
   */
  static async addRelationship(sourceModel, sourceId, targetModel, targetId, relationshipType, weight = 1.0, metadata = {}) {
    if (!Object.values(RELATIONSHIP_TYPES).includes(relationshipType)) {
      throw new KnowledgeError('Invalid relationship type', ERROR_CODES.VALIDATION_FAILED);
    }

    // Upsert to prevent duplicate edges
    return await KnowledgeRelationship.findOneAndUpdate(
      { sourceId, targetId, relationshipType },
      { sourceModel, targetModel, weight, metadata },
      { upsert: true, new: true }
    );
  }

  /**
   * Removes a connection between nodes.
   */
  static async removeRelationship(sourceId, targetId, relationshipType) {
    return await KnowledgeRelationship.findOneAndDelete({ sourceId, targetId, relationshipType });
  }

  /**
   * Gets all outbound connections for a node.
   */
  static async getNeighbors(nodeId) {
    return await KnowledgeRelationship.find({ sourceId: nodeId });
  }

  /**
   * Resolves prerequisites for a specific FAQ or Document.
   */
  static async getPrerequisites(nodeId) {
    return await KnowledgeRelationship.find({ sourceId: nodeId, relationshipType: RELATIONSHIP_TYPES.PREREQUISITE });
  }
}
