import { env } from '../config/env.js';
import { logger } from '../config/logger.js';

/**
 * RAG Service - Retrieval Augmented Generation for Query Resolution
 * 
 * This service handles:
 * 1. Hybrid search (vector + keyword) across approved program-scoped knowledge
 * 2. Citation verification - ensures sources are approved and within program scope
 * 3. Answer generation with grounded citations
 */
export class RAGService {
  /**
   * Retrieve relevant documents from approved knowledge base
   * @param {string} queryText - The user's query
   * @param {string} programId - Program scope for filtering
   * @returns {Object} Retrieval results with confidence scores
   */
  static async retrieve(queryText, programId) {
    try {
      // Attempt to import from csfaq knowledge engine (for integration mode)
      let semanticResults = [];
      let keywordResults = [];
      
      try {
        const { SemanticSearch } = await import('../../../csfaq/server/src/modules/search/engine/SemanticSearch.js');
        const { KeywordSearch } = await import('../../../csfaq/server/src/modules/search/engine/KeywordSearch.js');
        
        const [semantic, keyword] = await Promise.all([
          SemanticSearch.search({ normalized: queryText }, 20),
          KeywordSearch.search({ normalized: queryText }, 20),
        ]);
        
        semanticResults = semantic || [];
        keywordResults = keyword || [];
      } catch (importError) {
        // Running standalone - no csfaq integration
        logger.debug('RAG running in standalone mode, no csfaq search available');
      }

      // Filter and merge results by program scope
      const filteredResults = this.filterByProgramScope(
        [...semanticResults, ...keywordResults],
        programId
      );

      // Score and rank results
      const scoredResults = this.scoreResults(filteredResults, queryText);
      
      if (scoredResults.length === 0) {
        return {
          documents: [],
          evidence: [],
          confidence: 0,
          commonalityScore: 0,
          draftAnswer: null,
        };
      }

      // Calculate confidence based on top results
      const topScore = scoredResults[0]?.score || 0;
      const confidence = Math.min(topScore, 1);
      
      // Calculate commonality score (how many similar results exist)
      const highScoreCount = scoredResults.filter(r => r.score >= 0.7).length;
      const commonalityScore = Math.min(highScoreCount / 5, 1);

      return {
        documents: scoredResults.slice(0, 5),
        evidence: scoredResults.map(r => ({
          sourceType: r.type || 'faq',
          sourceId: r._id?.toString() || r.id,
          sourceVersion: r.version?.toString(),
          score: r.score,
          approved: r.approvalStatus === 'published' || r.approvalStatus === 'approved',
          programId: programId,
        })),
        confidence,
        commonalityScore,
        draftAnswer: scoredResults[0]?.answer || scoredResults[0]?.text,
      };
    } catch (error) {
      logger.error('RAG retrieve error:', error);
      return {
        documents: [],
        evidence: [],
        confidence: 0,
        commonalityScore: 0,
        draftAnswer: null,
      };
    }
  }

  /**
   * Filter results by program scope (cross-program access is forbidden)
   */
  static filterByProgramScope(results, programId) {
    return results.filter(doc => {
      // Must match program scope
      if (doc.programId && doc.programId !== programId) {
        return false;
      }
      // Only approved sources
      if (doc.approvalStatus && !['published', 'approved'].includes(doc.approvalStatus)) {
        return false;
      }
      return true;
    });
  }

  /**
   * Score results based on relevance
   */
  static scoreResults(results, queryText) {
    const queryTerms = queryText.toLowerCase().split(/\s+/);
    
    return results.map(doc => {
      let score = doc.score || doc._score || 0.5;
      
      // Boost for exact term matches in question
      const docText = `${doc.question || doc.title || ''} ${doc.answer || doc.text || ''}`.toLowerCase();
      const exactMatches = queryTerms.filter(term => docText.includes(term)).length;
      score += (exactMatches / queryTerms.length) * 0.2;
      
      // Boost for published/approved status
      if (doc.approvalStatus === 'published') score += 0.1;
      
      // Boost for high popularity
      if (doc.popularityScore > 50) score += 0.05;
      
      return { ...doc, score: Math.min(score, 1) };
    }).sort((a, b) => b.score - a.score);
  }

  /**
   * Verify citations and generate answer (requires high confidence)
   */
  static async verifyAndGenerate(queryText, documents, programId) {
    if (!documents || documents.length === 0) {
      return { verified: false, answer: null, confidence: 0 };
    }

    // Verify all sources are approved
    const allApproved = documents.every(doc => 
      doc.approvalStatus === 'published' || doc.approvalStatus === 'approved'
    );
    
    if (!allApproved) {
      return { verified: false, answer: null, confidence: 0 };
    }

    // Verify citations are traceable to sources
    const citationsTraceable = this.verifyCitations(queryText, documents);
    
    if (!citationsTraceable) {
      return { verified: false, answer: null, confidence: 0 };
    }

    // Check for contradictions between sources
    const hasContradictions = this.checkContradictions(documents);
    
    if (hasContradictions) {
      return { verified: false, answer: null, confidence: 0 };
    }

    // Generate answer (in production, call LLM here)
    const answer = this.generateAnswer(queryText, documents);
    
    return {
      verified: true,
      answer,
      confidence: documents[0]?.score || 0.85,
      model: 'citation-grounded',
    };
  }

  /**
   * Verify citations are traceable to source documents
   */
  static verifyCitations(queryText, documents) {
    // Simple verification: query terms should appear in source documents
    const queryTerms = queryText.toLowerCase().split(/\s+/).filter(t => t.length > 3);
    
    for (const doc of documents) {
      const docText = `${doc.question || doc.title || ''} ${doc.answer || doc.text || ''}`.toLowerCase();
      const matches = queryTerms.filter(term => docText.includes(term)).length;
      
      // At least 30% of query terms should appear in document
      if (matches / queryTerms.length < 0.3) {
        return false;
      }
    }
    
    return true;
  }

  /**
   * Check for contradictions between sources
   */
  static checkContradictions(documents) {
    // Simplified contradiction check
    // In production, use NLP or LLM for this
    const answers = documents.map(d => d.answer || d.text || '').filter(Boolean);
    
    // If multiple sources have very different answers, flag as potential contradiction
    if (answers.length > 1) {
      const avgLength = answers.reduce((sum, a) => sum + a.length, 0) / answers.length;
      const variance = answers.reduce((sum, a) => sum + Math.abs(a.length - avgLength), 0) / answers.length;
      
      // High variance might indicate contradictions
      if (variance / avgLength > 2) {
        logger.warn('Potential source contradiction detected');
        return true;
      }
    }
    
    return false;
  }

  /**
   * Generate answer from verified documents
   * In production, this would call an LLM with strict constraints
   */
  static generateAnswer(queryText, documents) {
    // Return the highest-scored document's answer as the generated answer
    // In production, use LLM for synthesis with citations
    const topDoc = documents[0];
    
    if (topDoc?.answer) {
      return topDoc.answer;
    }
    
    if (topDoc?.text) {
      return topDoc.text;
    }
    
    return null;
  }
}

export default RAGService;
