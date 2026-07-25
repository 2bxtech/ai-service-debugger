
import { Router, Request, Response } from 'express';
import { analyzeIncident, analyzeInitial, AnalyzeRequest } from '../services/anthropic';
import { toProviderHttpError } from '../services/anthropicErrors';

export const analyzeRouter = Router();

// Initial structured analysis
analyzeRouter.post('/initial', async (req: Request, res: Response) => {
  try {
    const { logs, serviceGraph } = req.body as AnalyzeRequest;
    if (!logs) {
      return res.status(400).json({ error: 'logs field is required' });
    }
    const result = await analyzeInitial({ logs, serviceGraph });

    // Try to parse as JSON, fall back to raw text
    try {
      const parsed = JSON.parse(result);
      return res.json({ analysis: parsed });
    } catch {
      return res.json({ analysis: null, rawText: result });
    }
  } catch (err: unknown) {
    const failure = toProviderHttpError(err);
    console.error('Analysis error', {
      providerStatus: failure.providerStatus,
      requestId: failure.requestId,
    });
    return res.status(failure.status).json({ error: failure.message });
  }
});

// Conversational follow-up
analyzeRouter.post('/chat', async (req: Request, res: Response) => {
  try {
    const body = req.body as AnalyzeRequest;
    if (!body.logs || !body.userMessage) {
      return res.status(400).json({ error: 'logs and userMessage are required' });
    }
    const reply = await analyzeIncident(body);
    return res.json({ reply });
  } catch (err: unknown) {
    const failure = toProviderHttpError(err);
    console.error('Chat error', {
      providerStatus: failure.providerStatus,
      requestId: failure.requestId,
    });
    return res.status(failure.status).json({ error: failure.message });
  }
});
