import { env } from '../src/config/env.js';

describe('AI environment config', () => {
  it('exposes OPENAI_API_KEY for AI providers', () => {
    expect(env).toHaveProperty('OPENAI_API_KEY');
  });
});
