
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { analyzeRouter } from './routes/analyze';
import { parseRouter } from './routes/parse';
import { samplesRouter } from './routes/samples';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173' }));
app.use(express.json({ limit: '5mb' }));

app.use('/api/analyze', analyzeRouter);
app.use('/api/parse', parseRouter);
app.use('/api/samples', samplesRouter);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});