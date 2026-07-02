import QueryCase, { QueryStatus, PriorityLevel } from '../models/QueryCase.model.js';
import { logger } from '../config/logger.js';
import { env } from '../config/env.js';
import { DECISION_REASONS } from '../constants/triage.constants.js';

/**
 * Cluster Service - Duplicate Detection and Incident Clustering
 * 
 * Implements the duplicate/incident clustering logic from product.md:
 * - Semantic similarity matching with configurable threshold
 * - Automatic clustering under parent incident
 * - Priority escalation for mass impact
 */
export class ClusterService {
  /**
   * Find potential duplicate based on text similarity
   */
  static async findPotentialDuplicate(queryText, programId, excludeId = null) {
    try {
      // Find recent awaiting_human cases in same program
      const recentCases = await QueryCase.find({
        programId,
        status: { $in: [QueryStatus.AWAITING_HUMAN, QueryStatus.ASSIGNED] },
        isParentIncident: true,
        createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }, // Last 24 hours
        ...(excludeId && { _id: { $ne: excludeId } }),
      }).sort({ createdAt: -1 }).limit(10);

      if (recentCases.length === 0) {
        return null;
      }

      // Calculate similarity with each case
      let bestMatch = null;
      let bestScore = 0;

      for (const caseItem of recentCases) {
        const similarity = this.calculateSimilarity(queryText, caseItem.title + ' ' + caseItem.body);
        
        if (similarity >= env.thresholds.duplicateSimilarity && similarity > bestScore) {
          bestScore = similarity;
          bestMatch = caseItem;
        }
      }

      return bestMatch;
    } catch (error) {
      logger.error('Error finding duplicate:', error);
      return null;
    }
  }

  /**
   * Calculate semantic similarity between two texts
   * Uses simple TF-IDF cosine similarity
   */
  static calculateSimilarity(text1, text2) {
    const tokens1 = this.tokenize(text1);
    const tokens2 = this.tokenize(text2);
    
    // Calculate term frequencies
    const tf1 = this.calculateTermFrequency(tokens1);
    const tf2 = this.calculateTermFrequency(tokens2);
    
    // Get all unique terms
    const allTerms = new Set([...Object.keys(tf1), ...Object.keys(tf2)]);
    
    if (allTerms.size === 0) return 0;
    
    // Calculate TF-IDF vectors
    const idf = this.calculateIDF([tokens1, tokens2]);
    
    const vec1 = [];
    const vec2 = [];
    
    for (const term of allTerms) {
      vec1.push((tf1[term] || 0) * idf[term]);
      vec2.push((tf2[term] || 0) * idf[term]);
    }
    
    // Calculate cosine similarity
    const dotProduct = vec1.reduce((sum, v, i) => sum + v * vec2[i], 0);
    const magnitude1 = Math.sqrt(vec1.reduce((sum, v) => sum + v * v, 0));
    const magnitude2 = Math.sqrt(vec2.reduce((sum, v) => sum + v * v, 0));
    
    if (magnitude1 === 0 || magnitude2 === 0) return 0;
    
    return dotProduct / (magnitude1 * magnitude2);
  }

  /**
   * Tokenize text into normalized terms
   */
  static tokenize(text) {
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(token => token.length > 2)
      .filter(token => !this.isStopWord(token));
  }

  /**
   * Simple stop word list
   */
  static isStopWord(word) {
    const stopWords = new Set([
      'the', 'is', 'at', 'which', 'on', 'a', 'an', 'and', 'or', 'but',
      'in', 'with', 'to', 'for', 'of', 'as', 'by', 'from', 'this', 'that',
      'these', 'those', 'be', 'have', 'has', 'had', 'it', 'its', 'can', 'could',
      'will', 'would', 'should', 'may', 'might', 'must', 'i', 'you', 'we', 'they',
    ]);
    return stopWords.has(word);
  }

  /**
   * Calculate term frequency
   */
  static calculateTermFrequency(tokens) {
    const tf = {};
    for (const token of tokens) {
      tf[token] = (tf[token] || 0) + 1;
    }
    // Normalize
    const maxFreq = Math.max(...Object.values(tf), 1);
    for (const token in tf) {
      tf[token] = tf[token] / maxFreq;
    }
    return tf;
  }

  /**
   * Calculate inverse document frequency
   */
  static calculateIDF(documents) {
    const idf = {};
    const N = documents.length;
    
    // Count document frequency for each term
    const df = {};
    for (const doc of documents) {
      const uniqueTokens = new Set(doc);
      for (const token of uniqueTokens) {
        df[token] = (df[token] || 0) + 1;
      }
    }
    
    // Calculate IDF
    for (const token in df) {
      idf[token] = Math.log(N / df[token]) + 1;
    }
    
    return idf;
  }

  /**
   * Link a case to a parent incident
   */
  static async linkToParent(childCaseId, parentCaseId) {
    const childCase = await QueryCase.findById(childCaseId);
    const parentCase = await QueryCase.findById(parentCaseId);
    
    if (!childCase || !parentCase) {
      throw new Error('Case not found');
    }
    
    // Update child case
    childCase.parentIncidentId = parentCaseId;
    childCase.status = QueryStatus.AWAITING_HUMAN; // Keep in queue but linked
    await childCase.save();
    
    // Update parent case
    parentCase.linkedCaseCount = (parentCase.linkedCaseCount || 0) + 1;
    
    // Escalate priority if many affected
    if (parentCase.linkedCaseCount >= 5) {
      parentCase.priority = PriorityLevel.P1;
    }
    
    await parentCase.save();
    
    return { childCase, parentCase };
  }

  /**
   * Create a new parent incident case
   */
  static async createParentIncident(queryCase) {
    queryCase.isParentIncident = true;
    queryCase.linkedCaseCount = 0;
    await queryCase.save();
    
    return queryCase;
  }

  /**
   * Get all cases linked to a parent incident
   */
  static async getLinkedCases(parentIncidentId) {
    return QueryCase.find({
      $or: [
        { _id: parentIncidentId },
        { parentIncidentId: parentIncidentId },
      ],
      isDeleted: false,
    }).sort({ createdAt: 1 });
  }

  /**
   * Broadcast resolution to all linked cases
   */
  static async broadcastResolution(parentIncidentId, resolution) {
    const linkedCases = await this.getLinkedCases(parentIncidentId);
    
    const updates = linkedCases.map(async (caseItem) => {
      caseItem.status = QueryStatus.RESOLVED;
      caseItem.finalAnswer = resolution;
      caseItem.resolvedAt = new Date();
      await caseItem.save();
    });
    
    await Promise.all(updates);
    
    return linkedCases.length;
  }

  /**
   * Batch link similar incoming queries
   */
  static async processBatchSimilarity(queries, programId) {
    const results = [];
    const processed = new Set();
    
    for (let i = 0; i < queries.length; i++) {
      if (processed.has(queries[i]._id?.toString())) continue;
      
      const queryText = queries[i].title + ' ' + queries[i].body;
      let parent = null;
      let linkCount = 0;
      
      // Find similar queries in batch
      for (let j = i + 1; j < queries.length; j++) {
        if (processed.has(queries[j]._id?.toString())) continue;
        
        const otherText = queries[j].title + ' ' + queries[j].body;
        const similarity = this.calculateSimilarity(queryText, otherText);
        
        if (similarity >= env.thresholds.duplicateSimilarity * 0.85) { // Slightly lower for batch
          // Link to current as parent
          await this.linkToParent(queries[j]._id, queries[i]._id);
          processed.add(queries[j]._id.toString());
          linkCount++;
        }
      }
      
      // If multiple links, make this a parent incident
      if (linkCount >= 2) {
        await this.createParentIncident(queries[i]);
        processed.add(queries[i]._id.toString());
      }
      
      results.push({
        caseId: queries[i]._id,
        linkedCount: linkCount,
        isParent: linkCount >= 2,
      });
    }
    
    return results;
  }
}

export default ClusterService;
