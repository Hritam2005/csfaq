import { ResponseGuard } from './ResponseGuard.js';

describe('ResponseGuard', () => {
  it('flags generic greetings and offers a more useful prompt', () => {
    const result = ResponseGuard.evaluate('hello there');

    expect(result.shouldFilter).toBe(true);
    expect(result.reply).toContain('Ask me something specific');
    expect(result.suggestions.length).toBeGreaterThan(0);
  });

  it('keeps specific questions intact', () => {
    const result = ResponseGuard.evaluate('How do I apply for the internship?');

    expect(result.shouldFilter).toBe(false);
    expect(result.reply).toBe('');
  });
});
