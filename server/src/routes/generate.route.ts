import { Router, Request, Response } from 'express';
import { generateFullSpec } from '../pipeline/spec-generator';
import { regenerateSection } from '../pipeline/section-regenerator';
import { generateDesignDirections } from '../pipeline/design-bundler';
import { UserProviderConfig, SpecSectionId } from '@blueprint/shared';

const router = Router();

// Helper to validate provider credentials
function extractProviderConfig(body: any): UserProviderConfig {
  const { provider, apiKey, model, customEndpoint } = body;
  if (!provider) {
    throw new Error('Please select an LLM provider to run generation.');
  }
  if (!apiKey) {
    throw new Error(`API key is required for provider '${provider}'.`);
  }
  return {
    provider,
    apiKey: apiKey || '',
    model,
    customEndpoint,
  };
}

// POST /api/generate/spec
router.post('/spec', async (req: Request, res: Response) => {
  try {
    const { idea, classification } = req.body;
    if (!idea || !classification) {
      return res.status(400).json({ error: 'Missing idea or classification context in request body.' });
    }

    const config = extractProviderConfig(req.body);
    const specDoc = await generateFullSpec(idea, classification, config);

    return res.json({ specDoc });
  } catch (err: any) {
    console.error('Error generating spec:', err);
    return res.status(500).json({ error: err.message || 'Failed to generate specification document.' });
  }
});

// POST /api/generate/section
router.post('/section', async (req: Request, res: Response) => {
  try {
    const { idea, classification, sectionId, allSections, customInstructions } = req.body;
    if (!idea || !classification || !sectionId || !allSections) {
      return res.status(400).json({ error: 'Missing required parameters for section regeneration.' });
    }

    const config = extractProviderConfig(req.body);
    const result = await regenerateSection({
      idea,
      classification,
      sectionId: sectionId as SpecSectionId,
      allSections,
      customInstructions,
      config,
    });

    return res.json(result);
  } catch (err: any) {
    console.error('Error regenerating section:', err);
    return res.status(500).json({ error: err.message || 'Failed to regenerate section.' });
  }
});

// POST /api/generate/design
router.post('/design', async (req: Request, res: Response) => {
  try {
    const { idea, classification } = req.body;
    if (!idea || !classification) {
      return res.status(400).json({ error: 'Missing idea or classification context for design generation.' });
    }

    const config = extractProviderConfig(req.body);
    const designResult = await generateDesignDirections(idea, classification, config);

    return res.json(designResult);
  } catch (err: any) {
    console.error('Error generating design directions:', err);
    return res.status(500).json({ error: err.message || 'Failed to generate design directions.' });
  }
});

export default router;
