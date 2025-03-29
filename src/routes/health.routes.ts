import { Router } from 'express';

const router = Router();

router.get('/health', (_req, res) => {
  res.json({ status: '🟢 Core Node is alive and healthy!' });
});

export default router;