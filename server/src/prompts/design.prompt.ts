import { ClassificationResult } from '@blueprint/shared';

export function buildDesignPrompt(idea: string, classification: ClassificationResult): { prompt: string; systemPrompt: string } {
  const systemPrompt = `You are an elite Design Systems Lead and Creative Director.
Your task is to generate TWO coherent, distinct, and complete design direction bundles tailored specifically to the given software application.

CRITICAL REQUIREMENT:
DO NOT default to "Warm Neumorph" or "Aurora Glassmorphism" unless the project theme specifically demands them.
Instead, deeply analyze the project's Domain (${classification.domain}), Platform (${classification.platform}), Audience (${classification.targetAudience}), and conceptual theme, and generate TWO completely unique design directions tailored to this exact project's personality.

Theme-matching examples:
- Developer Tools / CLI / Cloud: "Cyber Monoline Dark" (obsidian slate, terminal green, hairline borders) vs "Modern Minimalist Light" (clean sans, subtle slate shadows, indigo accents)
- Fintech / Banking / Enterprise: "High-Trust Swiss Luxe" (deep navy, champagne gold, dense tabular layout) vs "Minimalist Monochrome" (sharp monochrome, crisp typography)
- Gaming / 3D / Web3: "Cyberpunk Neon Grid" (vivid glow, dark obsidian, angled glass) vs "Retro Arcade Monolith" (high-contrast amber/dark gray)
- Health / Wellness / Medical: "Clinical Clarity" (pure whites, soft teal, high legibility) vs "Calm Organic Earth" (warm neutrals, sage, rounded tactile cards)
- E-commerce / Fashion: "Editorial High-Fashion" (luxurious serifs, minimalist monochrome, gold accents) vs "Vibrant Neo-Brutalist" (high-energy pastels, bold black borders)
- AI / Automation: "Futuristic Glassmorphic HUD" vs "Clean Enterprise Workspace"

Requirements:
1. Direction 1 MUST be the primary, flagship aesthetic tailored to the project's personality and domain.
2. Direction 2 MUST be a contrasting, equally viable design style (e.g. Dark vs Light, Minimalist vs Expressive, or High-Density vs Editorial).
3. Provide realistic Tailwind CSS utility classes in 'componentPreview' (buttonClass, cardClass, badgeClass, inputClass) so the client can render interactive previews accurately.
4. Respond with valid JSON ONLY matching the requested schema.`;

  const prompt = `Application Context:
- Idea: ${idea}
- Platform: ${classification.platform}
- Domain: ${classification.domain}
- Target Audience: ${classification.targetAudience}

Generate two distinct, project-tailored design directions adhering strictly to this JSON format:
{
  "directions": [
    {
      "id": "direction-1",
      "name": "Flagship Style Name (e.g., Cyber Monoline Dark / High-Trust Swiss Luxe)",
      "badge": "Recommended for this Project Theme",
      "philosophy": "Detailed design philosophy explaining why this aesthetic perfectly elevates this specific software concept.",
      "style": {
        "name": "Specific style name",
        "description": "Visual characteristics of surfaces, borders, elevations, and interactions.",
        "surface": "Tailwind classes for surfaces e.g. bg-slate-900 text-slate-100",
        "shadow": "Tailwind shadow class e.g. shadow-lg shadow-emerald-500/10",
        "border": "Tailwind border class e.g. border border-slate-800",
        "cornerRadius": "Tailwind rounded class e.g. rounded-xl"
      },
      "typography": {
        "headingFont": "Google Font name for headings",
        "bodyFont": "Google Font name for body",
        "monoFont": "Google Font name for code/data",
        "scaleDescription": "Explanation of font hierarchy and typographic voice",
        "sampleHeadline": "Realistic sample headline showcasing the project's value proposition"
      },
      "layout": {
        "style": "Layout architecture description e.g. High-density command center or Editorial single-column",
        "density": "Density description e.g. Compact 16px grid or Generous 32px padding",
        "containerWidth": "Tailwind width e.g. max-w-6xl mx-auto",
        "gridSystem": "Grid system description e.g. Multi-pane responsive grid"
      },
      "colors": {
        "base": "#hex code for app background",
        "surface": "#hex code for card/panel surface",
        "primary": "#hex code for primary brand action",
        "secondary": "#hex code for secondary brand element",
        "accent": "#hex code for callouts/badges",
        "textPrimary": "#hex code for primary text",
        "textSecondary": "#hex code for secondary/muted text",
        "border": "#hex code or rgba for borders",
        "isDark": false
      },
      "icons": {
        "style": "Icon weight and style description e.g. Monoline 1.5px stroke or Solid duotone",
        "library": "Icon library e.g. Lucide Linear / Tabler",
        "description": "How icons harmonize with the UI geometry"
      },
      "accessibilityNotes": "WCAG compliance notes, contrast ratio verification, and focus state strategy.",
      "contrastRatio": "e.g. 7.5:1",
      "contrastRating": "WCAG AA Pass or WCAG AAA Pass",
      "responsiveNotes": "Mobile breakpoint scaling and touch target optimization.",
      "componentPreview": {
        "buttonClass": "Valid Tailwind classes for interactive button",
        "cardClass": "Valid Tailwind classes for interactive card",
        "badgeClass": "Valid Tailwind classes for status badge",
        "inputClass": "Valid Tailwind classes for text input"
      }
    },
    {
      "id": "direction-2",
      "name": "Contrasting Style Name (e.g., Minimalist Silicon Valley Light / Neo-Brutalist Expressive)",
      "badge": "Contrasting Theme Alternative",
      "philosophy": "Detailed design philosophy explaining the alternative experience and trade-offs.",
      "style": {
        "name": "Specific style name",
        "description": "Visual characteristics of surfaces, borders, elevations, and interactions.",
        "surface": "Tailwind classes for surfaces",
        "shadow": "Tailwind shadow class",
        "border": "Tailwind border class",
        "cornerRadius": "Tailwind rounded class"
      },
      "typography": {
        "headingFont": "Heading font name",
        "bodyFont": "Body font name",
        "monoFont": "Mono font name",
        "scaleDescription": "Typographic scale description",
        "sampleHeadline": "Alternative sample headline"
      },
      "layout": {
        "style": "Layout style",
        "density": "Density",
        "containerWidth": "Tailwind width",
        "gridSystem": "Grid system"
      },
      "colors": {
        "base": "#hex",
        "surface": "#hex",
        "primary": "#hex",
        "secondary": "#hex",
        "accent": "#hex",
        "textPrimary": "#hex",
        "textSecondary": "#hex",
        "border": "#hex",
        "isDark": true
      },
      "icons": {
        "style": "Icon style",
        "library": "Icon library",
        "description": "Icon harmonious description"
      },
      "accessibilityNotes": "Contrast and accessibility notes",
      "contrastRatio": "e.g. 9.1:1",
      "contrastRating": "WCAG AAA Pass",
      "responsiveNotes": "Mobile layout responsiveness",
      "componentPreview": {
        "buttonClass": "Valid Tailwind classes",
        "cardClass": "Valid Tailwind classes",
        "badgeClass": "Valid Tailwind classes",
        "inputClass": "Valid Tailwind classes"
      }
    }
  ],
  "rationale": "Comparative summary explaining why both generated directions fit this specific project theme and the strategic trade-offs between them."
}

Output JSON only:`;

  return { prompt, systemPrompt };
}
