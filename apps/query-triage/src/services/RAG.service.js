import OpenAI from 'openai';
import { env } from '../config/env.js';
import { logger } from '../config/logger.js';

let openaiClient = null;
try {
  openaiClient = new OpenAI({
    apiKey: env.openai?.apiKey || 'sk-local-no-key-required',
    baseURL: env.openai?.baseUrl || 'http://127.0.0.1:8080/v1',
  });
} catch (e) {
  logger.warn('Failed to initialize OpenAI/Local LLM client:', e.message);
}

const STANDALONE_KNOWLEDGE_BASE = [
  {
    _id: 'vins_faq_001',
    id: 'vins_faq_001',
    programId: 'prog_vins_2026',
    title: 'Vicharanashala Internship Phases and Badges (VINS)',
    question: 'What is VINS and what are the phases Bronze, Silver, Gold, Platinum badges?',
    answer: 'VINS is the Vicharanashala Internship online open-source engineering programme at IIT Ropar without stipend. Phase 1 (Bronze) is initial training and CSFAQ project submission. Phase 2 (Silver) is main open-source contribution under a mentor. Finishing Bronze and Silver completes your internship and earns the certificate. Gold is awarded during Silver for exceptional feature contributions. Platinum is an invitation to visit the IIT Ropar lab.',
    approvalStatus: 'published',
    popularityScore: 95,
    version: 1,
    type: 'faq'
  },
  {
    _id: 'vins_faq_002',
    id: 'vins_faq_002',
    programId: 'prog_vins_2026',
    title: 'Internship Duration and December Deadline Rule',
    question: 'How long is the internship duration and what is the last finish date?',
    answer: 'The internship is two months full-time from your chosen start date, with up to one month optional grace period. Your internship must finish on or before 31 December 2026. Leave during the internship for college exams is not permitted; if your exams fall during the window, you must defer your start until after your exams end.',
    approvalStatus: 'published',
    popularityScore: 92,
    version: 1,
    type: 'policy'
  },
  {
    _id: 'vins_faq_003',
    id: 'vins_faq_003',
    programId: 'prog_vins_2026',
    title: 'NOC Submission Rules, Format, and Authorised Signatories',
    question: 'Who can sign the NOC, what format is required, and can my HOD email it?',
    answer: 'Your NOC must be physically signed by hand and rubber stamped by an authorised signatory at your institution (HOD, Dean, Principal, or TPO). You must download the blank NOC from your dashboard at samagama.in and upload the signed PDF yourself. NOCs sent via email by students or HODs are not accepted. The internship formally begins only after your uploaded NOC is validated.',
    approvalStatus: 'published',
    popularityScore: 98,
    version: 2,
    type: 'policy'
  },
  {
    _id: 'vins_faq_004',
    id: 'vins_faq_004',
    programId: 'prog_vins_2026',
    title: 'Offer Letter Issuance and 3-Step Acceptance Process',
    question: 'When do I get my offer letter and how do I accept it?',
    answer: 'Your official offer letter on Vicharanashala letterhead is issued automatically on your samagama.in dashboard once your uploaded institutional NOC is validated. To accept, you must complete three steps on your dashboard within 5 days: (1) sign and upload the offer letter acceptance block, (2) agree to the Terms & Conditions, and (3) sign and upload the Honor Code PDF.',
    approvalStatus: 'published',
    popularityScore: 90,
    version: 1,
    type: 'faq'
  },
  {
    _id: 'vins_faq_005',
    id: 'vins_faq_005',
    programId: 'prog_vins_2026',
    title: 'Rosetta Daily Internship Journal and Thinking Routines',
    question: 'What is Rosetta and can I use ChatGPT or AI to write my daily journal entries?',
    answer: 'Rosetta is your daily reflection journal designed around structured thinking routines. You must write authentic entries every day during your internship. Using ChatGPT or any AI generation tool to write Rosetta entries is strictly forbidden and constitutes an Honor Code violation.',
    approvalStatus: 'published',
    popularityScore: 88,
    version: 1,
    type: 'policy'
  },
  {
    _id: 'vins_faq_006',
    id: 'vins_faq_006',
    programId: 'prog_vins_2026',
    title: 'ViBe Learning Platform and Spurti Points (SP) Tracking',
    question: 'What are Spurti Points (SP) and how do video quiz restrictions work on ViBe?',
    answer: 'Spurti Points (SP) track your continuous learning rhythm and participation on ViBe and live standups. ViBe enforces linear progression and quiet helper proctoring; skipping ahead or leaving video clips uncompleted will restrict course access until resolved.',
    approvalStatus: 'published',
    popularityScore: 86,
    version: 1,
    type: 'faq'
  },
  {
    _id: 'kb_faq_001',
    id: 'kb_faq_001',
    programId: 'prog_cs_2026',
    title: 'Central Science Library Weekend & Evening Opening Hours',
    question: 'What are the weekend opening hours for the central science library study halls on Sundays and Saturdays?',
    answer: 'The Central Science Library and study halls are open from 9:00 AM to 8:00 PM on Saturdays and Sundays during regular semester weeks. Extended overnight hours apply during final exam periods.',
    approvalStatus: 'published',
    popularityScore: 85,
    version: 1,
    type: 'faq'
  },
  {
    _id: 'kb_faq_002',
    id: 'kb_faq_002',
    programId: 'prog_cs_2026',
    title: 'Tuition Fee Payment Discrepancies and Ledger Reconciliations',
    question: 'Why does my receipt show an unpaid balance or fee due after completing tuition fee payment transaction debited?',
    answer: 'Online fee payment transactions can take up to 24 to 48 business hours to reflect in student account ledgers due to bank gateway reconciliation. If transaction debited but shows unpaid balance over 48 hours, submit the transaction ID and receipt for manual ledger clearing.',
    approvalStatus: 'published',
    popularityScore: 90,
    version: 2,
    type: 'policy'
  }
];

/**
 * RAG Service - Retrieval Augmented Generation for Query Resolution
 * 
 * This service handles:
 * 1. Hybrid search (vector + keyword) across approved program-scoped knowledge
 * 2. Citation verification - ensures sources are approved and within program scope
 * 3. Answer generation with grounded citations via Local LLM (llama.cpp Qwen2.5) or OpenAI
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
        logger.debug('RAG running in standalone mode, using built-in standalone knowledge base');
      }

      let combinedResults = [...semanticResults, ...keywordResults];
      if (combinedResults.length === 0) {
        combinedResults = [...STANDALONE_KNOWLEDGE_BASE];
      }

      // Filter and merge results by program scope
      const filteredResults = this.filterByProgramScope(combinedResults, programId);

      // Score and rank results
      const scoredResults = this.scoreResults(filteredResults, queryText);
      
      if (scoredResults.length === 0 || scoredResults[0].score < 0.25) {
        return {
          documents: [],
          evidence: [],
          confidence: 0,
          commonalityScore: 0,
          draftAnswer: null,
        };
      }

      const topScore = scoredResults[0]?.score || 0;
      const confidence = Math.min(topScore, 1);
      
      const highScoreCount = scoredResults.filter(r => r.score >= 0.7).length;
      const commonalityScore = Math.min(highScoreCount / 2, 1);

      return {
        documents: scoredResults.slice(0, 5),
        evidence: scoredResults.slice(0, 3).map(r => ({
          sourceType: r.type || 'faq',
          sourceId: r._id?.toString() || r.id,
          sourceVersion: r.version?.toString() || '1',
          score: r.score,
          approved: r.approvalStatus === 'published' || r.approvalStatus === 'approved',
          programId: programId || r.programId,
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
      if (programId && doc.programId && doc.programId !== programId) {
        return false;
      }
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
    const queryTerms = queryText.toLowerCase().split(/\s+/).filter(t => t.length > 2);
    
    return results.map(doc => {
      let score = doc.score || doc._score || 0.45;
      
      const docText = `${doc.question || doc.title || ''} ${doc.answer || doc.text || ''}`.toLowerCase();
      const exactMatches = queryTerms.filter(term => docText.includes(term)).length;
      if (queryTerms.length > 0) {
        score += (exactMatches / queryTerms.length) * 0.45;
      }
      
      if (doc.approvalStatus === 'published') score += 0.1;
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

    const allApproved = documents.every(doc => 
      doc.approvalStatus === 'published' || doc.approvalStatus === 'approved'
    );
    
    if (!allApproved) {
      return { verified: false, answer: null, confidence: 0 };
    }

    const citationsTraceable = this.verifyCitations(queryText, documents);
    if (!citationsTraceable) {
      return { verified: false, answer: null, confidence: 0 };
    }

    const hasContradictions = this.checkContradictions(documents);
    if (hasContradictions) {
      return { verified: false, answer: null, confidence: 0 };
    }

    const answer = await this.generateAnswer(queryText, documents);
    
    return {
      verified: true,
      answer,
      confidence: documents[0]?.score || 0.88,
      model: env.openai?.model || 'qwen2.5-coder-1.5b (local)',
    };
  }

  /**
   * Verify citations are traceable to source documents
   */
  static verifyCitations(queryText, documents) {
    const queryTerms = queryText.toLowerCase().split(/\s+/).filter(t => t.length > 3);
    if (queryTerms.length === 0) return true;
    
    for (const doc of documents) {
      const docText = `${doc.question || doc.title || ''} ${doc.answer || doc.text || ''}`.toLowerCase();
      const matches = queryTerms.filter(term => docText.includes(term)).length;
      
      if (matches / queryTerms.length < 0.25) {
        return false;
      }
    }
    return true;
  }

  /**
   * Check for contradictions between sources
   */
  static checkContradictions(documents) {
    const answers = documents.map(d => d.answer || d.text || '').filter(Boolean);
    if (answers.length > 1) {
      const avgLength = answers.reduce((sum, a) => sum + a.length, 0) / answers.length;
      const variance = answers.reduce((sum, a) => sum + Math.abs(a.length - avgLength), 0) / answers.length;
      
      if (avgLength > 0 && variance / avgLength > 2.5) {
        logger.warn('Potential source contradiction detected');
        return true;
      }
    }
    return false;
  }

  /**
   * Generate answer from verified documents using Local LLM (llama.cpp) or OpenAI
   */
  static async generateAnswer(queryText, documents) {
    const topDoc = documents[0];
    const fallbackAnswer = topDoc?.answer || topDoc?.text || 'Information verified from approved policy documents.';
    
    if (!openaiClient) {
      return fallbackAnswer;
    }

    try {
      const contextText = documents
        .slice(0, 3)
        .map((doc, idx) => `[Source ${idx + 1}: ${doc.title || doc.question}]\n${doc.answer || doc.text}`)
        .join('\n\n');

      const response = await openaiClient.chat.completions.create({
        model: env.openai?.model || 'qwen2.5-coder-1.5b',
        messages: [
          {
            role: 'system',
            content: `You are Samagama AI, an autonomous query triage and resolution assistant. Answer the student's question accurately, concisely, and professionally using ONLY the provided verified knowledge base sources below. Include a brief reference to the policy source title.\n\nKnowledge Base:\n${contextText}`
          },
          {
            role: 'user',
            content: queryText
          }
        ],
        temperature: 0.2,
        max_tokens: 350
      });

      const aiText = response.choices?.[0]?.message?.content?.trim();
      if (aiText && aiText.length > 10) {
        logger.info('Successfully generated AI answer via local llama.cpp / Qwen model');
        return aiText;
      }
    } catch (llmError) {
      logger.warn(`Local LLM generation fallback (${llmError.message}). Using extracted FAQ text.`);
    }

    return fallbackAnswer;
  }
}

export default RAGService;
