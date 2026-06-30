export class SuggestedQuestions {
  /**
   * Simulates generating context-aware follow-up questions for the user interface.
   * In a real system, this could either use the LLM (expensive) or keyword extraction (cheap).
   */
  static generate(lastAssistantResponse) {
    if (!lastAssistantResponse) return [];

    const text = lastAssistantResponse.toLowerCase();
    const suggestions = [];

    // Simple heuristic-based follow-ups based on common enterprise topics
    if (text.includes('policy') || text.includes('manual')) {
      suggestions.push('Where can I download the full policy?');
      suggestions.push('Who do I contact for exceptions?');
    }
    
    if (text.includes('error') || text.includes('failed')) {
      suggestions.push('How do I troubleshoot this error?');
      suggestions.push('What are the common causes?');
    }

    if (text.includes('benefits') || text.includes('pto')) {
      suggestions.push('How do I check my current PTO balance?');
      suggestions.push('What is the approval process?');
    }

    // Default fallbacks
    if (suggestions.length === 0) {
      suggestions.push('Can you explain this in more detail?');
      suggestions.push('Could you provide an example?');
    }

    return suggestions.slice(0, 3);
  }
}
