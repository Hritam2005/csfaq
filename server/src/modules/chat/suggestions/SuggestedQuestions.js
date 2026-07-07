export class SuggestedQuestions {
  /**
   * Generates context-aware follow-up questions for the user interface.
   */
  static generate(lastAssistantResponse) {
    if (!lastAssistantResponse) return [];

    const text = lastAssistantResponse.toLowerCase();
    const suggestions = [];

    if (text.includes('apply') || text.includes('application')) {
      suggestions.push('What documents are required?');
      suggestions.push('What is the application deadline?');
    }

    if (text.includes('eligib') || text.includes('criteria') || text.includes('requirement')) {
      suggestions.push('Can students from any background apply?');
      suggestions.push('How do I apply for the internship?');
    }

    if (text.includes('document') || text.includes('resume') || text.includes('cv')) {
      suggestions.push('What is the eligibility criteria?');
      suggestions.push('How long does selection take?');
    }

    if (text.includes('remote') || text.includes('program') || text.includes('learn')) {
      suggestions.push('Will I receive a certificate?');
      suggestions.push('Is the internship remote or in-person?');
    }

    if (text.includes('support') || text.includes('contact') || text.includes('help')) {
      suggestions.push('I forgot my password. How do I reset it?');
      suggestions.push('Can Yaksha answer questions not in the FAQ?');
    }

    if (text.includes('policy') || text.includes('manual')) {
      suggestions.push('Where can I download the full policy?');
      suggestions.push('Who do I contact for exceptions?');
    }

    if (text.includes('error') || text.includes('failed')) {
      suggestions.push('How do I troubleshoot this error?');
      suggestions.push('How do I contact support?');
    }

    if (suggestions.length === 0) {
      suggestions.push('How do I apply for the internship?');
      suggestions.push('What is the eligibility criteria?');
      suggestions.push('What documents are required?');
    }

    return [...new Set(suggestions)].slice(0, 3);
  }
}
