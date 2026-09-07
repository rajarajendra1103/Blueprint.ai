import { Router, Request, Response } from 'express';
import { PROVIDERS_META, getAdapter } from '../adapters';
import { LLMProviderId } from '@blueprint/shared';

const router = Router();

// GET /api/providers
router.get('/', (_req: Request, res: Response) => {
  res.json({
    providers: PROVIDERS_META,
  });
});

// POST /api/providers/validate
router.post('/validate', async (req: Request, res: Response) => {
  try {
    const { provider, apiKey, model } = req.body || {};
    const cleanKey = typeof apiKey === 'string' ? apiKey.trim() : '';
    const cleanModel = typeof model === 'string' && model.trim() ? model.trim() : undefined;

    if (!provider) {
      return res.status(400).json({ valid: false, message: 'Provider ID is required.' });
    }

    if (!cleanKey) {
      return res.status(400).json({ valid: false, message: `API Key is required for provider '${provider}'.` });
    }

    const adapter = getAdapter(provider as LLMProviderId);
    const result = await adapter.validateKey(cleanKey, cleanModel);
    return res.json(result);
  } catch (err: any) {
    return res.status(500).json({
      valid: false,
      message: err.message || 'Key validation failed.',
    });
  }
});

export default router;
