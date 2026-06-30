import KnowledgeRelationship from '../models/KnowledgeRelationship.js';

class RelationshipRepository {
  static async create(data) {
    return await KnowledgeRelationship.create(data);
  }

  static async getNeighbors(sourceId) {
    // Finds all outbound connections from this node
    return await KnowledgeRelationship.find({ sourceId });
  }

  static async getInboundConnections(targetId) {
    // Finds all inbound connections pointing to this node
    return await KnowledgeRelationship.find({ targetId });
  }

  static async deleteRelationship(sourceId, targetId, relationshipType) {
    return await KnowledgeRelationship.findOneAndDelete({ sourceId, targetId, relationshipType });
  }

  static async deleteNode(nodeId) {
    // Deletes all relationships (inbound or outbound) connected to a deleted node
    return await KnowledgeRelationship.deleteMany({
      $or: [{ sourceId: nodeId }, { targetId: nodeId }]
    });
  }
}

export default RelationshipRepository;
