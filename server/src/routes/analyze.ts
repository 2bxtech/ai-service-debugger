
import { Router, Request, Response } from 'express';
import { analyzeIncident, analyzeInitial, AnalyzeRequest } from '../services/anthropic';

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
  } catch (err: any) {
    console.error('Analysis error:', err.message);
    return res.status(500).json({ error: 'Analysis failed', details: err.message });
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
  } catch (err: any) {
    console.error('Chat error:', err.message);
    return res.status(500).json({ error: 'Chat failed', details: err.message });
  }
});