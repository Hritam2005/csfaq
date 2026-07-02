export class ResponseGuard {
  static evaluate(prompt) {
    const normalized = (prompt || '').trim().toLowerCase();

    if (!normalized) {
      return {
        shouldFilter: true,
        reply: 'Please ask me a specific question about the internship or FAQ.',
        suggestions: ['How do I apply for the internship?', 'What is the eligibility criteria?']
      };
    }

    const genericPatterns = [
      /^hi+$/,
      /^hello+$/,
      /^hey+$/,
      /^thanks?$/,
      /^thank you$/,
      /^good morning$/,
      /^good evening$/,
      /^good night$/,
      /^(how are you|what's up|whats up|how's it going|who are you|what can you do)$/
    ];

    const greetingLike = /\b(hi|hello|hey|greetings)\b/i.test(normalized) && normalized.split(/\s+/).length <= 4;
    const isGeneric = genericPatterns.some((pattern) => pattern.test(normalized));
    const isTooCommon = /^(hi|hello|hey|thanks|thank you|ok|okay|yes|no|maybe|please|help)$/i.test(normalized);
    const isVague = !normalized.includes('?') && !/[a-z]{3,}/.test(normalized.replace(/\b(the|a|an|to|for|of|and|or|in|on|my|your)\b/g, '')) && normalized.split(/\s+/).length <= 4;

    if (isGeneric || isTooCommon || greetingLike || isVague) {
      return {
        shouldFilter: true,
        reply: 'I can help with the internship FAQ and support questions. Ask me something specific, like the application steps, eligibility, or document requirements.',
        suggestions: ['How do I apply for the internship?', 'What documents are required?', 'What is the eligibility criteria?']
      };
    }

    return {
      shouldFilter: false,
      reply: '',
      suggestions: []
    };
  }
}
