
import { Router, Request, Response } from 'express';
import { parseLogs } from '../services/logParser';

export const parseRouter = Router();

parseRouter.post('/', (req: Request, res: Response) => {
  const { rawLogs } = req.body;
  if (!rawLogs) return res.status(400).json({ error: 'rawLogs required' });

  return res.json(parseLogs(rawLogs));
});

