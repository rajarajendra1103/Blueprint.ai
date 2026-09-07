import { Router, Request, Response } from 'express';
import { classifyIdea } from '../pipeline/classifier';
import { UserProviderConfig } from '@blueprint/shared';

const router = Router();

// POST /api/classify
router.post('/', async (req: Request, res: Response) => {
  try {
    const { idea, provider, apiKey, model, customEndpoint } = req.body;

    if (!idea || typeof idea !== 'string' || idea.trim().length < 5) {
      return res.status(400).json({
        error: 'A descriptive software idea (at least 5 characters) is required.',
      });
    }

    if (!provider) {
      return res.status(400).json({
        error: 'Please connect an LLM provider (e.g. Gemini, Anthropic, OpenRouter) to proceed.',
      });
    }

    if (!apiKey) {
      return res.status(400).json({
        error: `An API key is required for provider '${provider}'. Keys are held strictly in your browser session and never persisted on the server.`,
      });
    }

    const config: UserProviderConfig = {
      provider,
      apiKey: apiKey || '',
      model,
      customEndpoint,
    };

    const classification = await classifyIdea(idea.trim(), config);
    return res.json({ classification });
  } catch (err: any) {
    console.error('Error during classification:', err);
    return res.status(500).json({
      error: err.message || 'Failed to classify idea. Please check your provider credentials and try again.',
    });
  }
});

export default router;
