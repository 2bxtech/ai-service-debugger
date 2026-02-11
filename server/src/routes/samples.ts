
import { Router } from 'express';
import { readFileSync } from 'fs';
import { join } from 'path';

export const samplesRouter = Router();

// In production, load from files. For now, inline the scenario metadata.
samplesRouter.get('/', (_req, res) => {
  res.json({
    scenarios: [
      {
        id: 'payment-cascade',
        name: 'Payment Processing Timeout Cascade',
        description: 'Stripe API latency causes retry storm → auth overload → gateway degraded mode',
        category: 'cascade',
      },
      {
        id: 'config-deploy',
        name: 'Feature Flag Deployment Gone Wrong',
        description: 'New pricing engine has null reference bug for users without subscription history',
        category: 'config',
      },
      {
        id: 'db-pool-exhaustion',
        name: 'Database Connection Pool Exhaustion',
        description: 'Unindexed analytical query blocks shared connection pool for 45 seconds',
        category: 'resource',
      },
    ],
  });
});

samplesRouter.get('/:id', (req, res) => {
  try {
    const dataPath = join(__dirname, '../../data/samples', `${req.params.id}.json`);
    const data = JSON.parse(readFileSync(dataPath, 'utf-8'));
    res.json(data);
  } catch {
    res.status(404).json({ error: `Sample '${req.params.id}' not found` });
  }