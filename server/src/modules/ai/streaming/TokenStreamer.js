export class TokenStreamer {
  /**
   * Express SSE (Server-Sent Events) wrapper for streaming tokens to the client.
   */
  static async streamResponse(res, asyncGenerator) {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    try {
      for await (const token of asyncGenerator) {
        res.write(`data: ${JSON.stringify({ token })}\n\n`);
      }
      res.write(`data: [DONE]\n\n`);
    } catch (error) {
      res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
    } finally {
      res.end();
    }
  }
}
