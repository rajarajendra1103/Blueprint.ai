import { Router, Request, Response } from 'express';
import { renderFullMarkdown } from '../export/exporter';

const router = Router();

// POST /api/export
router.post('/', (req: Request, res: Response) => {
  try {
    const { idea, classification, specDoc, selectedTechStack, selectedDesign, format } = req.body;

    if (!idea || !classification || !specDoc) {
      return res.status(400).json({ error: 'Incomplete project state provided for export.' });
    }

    const markdown = renderFullMarkdown({
      idea,
      classification,
      specDoc,
      selectedTechStack,
      selectedDesign,
    });

    if (format === 'markdown') {
      res.setHeader('Content-Type', 'text/markdown; charset=utf-8');
      res.setHeader('Content-Disposition', 'attachment; filename="blueprint-specification.md"');
      return res.send(markdown);
    }

    // Default JSON payload containing markdown and raw state
    return res.json({
      markdown,
      exportedAt: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error('Error rendering export:', err);
    return res.status(500).json({ error: err.message || 'Failed to export document.' });
  }
});

export default router;
