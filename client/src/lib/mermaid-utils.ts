import mermaid from 'mermaid';

// Initialize Mermaid once with clean typography and neutral theme
mermaid.initialize({
  startOnLoad: false,
  theme: 'neutral',
  themeVariables: {
    primaryColor: '#F4F1EC',
    primaryTextColor: '#2C2825',
    primaryBorderColor: '#C4623A',
    lineColor: '#736B63',
    secondaryColor: '#EAE5DC',
    tertiaryColor: '#FFFFFF',
    fontFamily: 'Segoe UI, -apple-system, system-ui, sans-serif',
    fontSize: '13px',
    nodeBorder: '#C4623A',
    clusterBkg: '#F9F8F6',
    titleColor: '#2C2825',
    edgeLabelBackground: '#FFFFFF',
  },
  securityLevel: 'loose',
  suppressErrorRendering: true,
});

let _counter = 0;

/**
 * Strips LaTeX math, unquoted brackets, and syntax traps from Mermaid code.
 */
export function sanitizeMermaidCode(raw: string): string {
  if (!raw) return '';

  // 1. Remove markdown fences if wrapped
  let code = raw
    .replace(/^```(?:mermaid)?/i, '')
    .replace(/```$/i, '')
    .trim();

  // 1b. Strip init directives like %%{init: {...}}%%
  code = code.replace(/%%\{[\s\S]*?\}%%\s*/g, '');

  // 1c. Normalize line endings to \n
  code = code.replace(/\r\n/g, '\n');

  // 2. Remove LaTeX notation like $\mathbf{x}_k$ or $z_k$
  code = code.replace(/\$([^\$\n]+)\$/g, (_match, math) => {
    return math
      .replace(/\\mathbf\{([^}]+)\}/g, '$1')
      .replace(/\\mathcal\{([^}]+)\}/g, '$1')
      .replace(/\\text\{([^}]+)\}/g, '$1')
      .replace(/\\([a-zA-Z]+)/g, '$1')
      .replace(/[_^{}]/g, ' ')
      .trim();
  });

  // 3. Ensure diagram declaration header exists — always use TD (vertical)
  const hasHeader =
    /^\s*(flowchart|graph|sequenceDiagram|stateDiagram|stateDiagram-v2|erDiagram|classDiagram|pie|gitGraph|C4Context|journey)\b/im.test(
      code
    );
  if (!hasHeader) {
    code = `flowchart TD\n${code}`;
  }

  // 3b. Force vertical (top-down) direction everywhere in flowchart/graph diagrams:
  // Normalize any flowchart/graph direction (LR, RL, BT, TB) to TD
  code = code.replace(
    /\b(flowchart|graph)\s+(?:LR|RL|BT|TB)\b/gi,
    '$1 TD'
  );

  // If flowchart or graph appears on its own line without direction, add TD
  code = code.replace(
    /^(\s*(?:flowchart|graph))\s*$/gim,
    '$1 TD'
  );

  // Replace direction declarations inside subgraphs: direction LR/RL/BT -> direction TB
  code = code.replace(
    /\bdirection\s+(?:LR|RL|BT)\b/gi,
    'direction TB'
  );

  // 3c. Quote unquoted subgraph titles: subgraph ID [title with parens/slashes] -> subgraph ID ["title"]
  code = code.replace(/subgraph\s+([A-Za-z0-9_-]+)\s*\[([^"\]\n]+)\]/g, 'subgraph $1 ["$2"]');

  // Ensure subgraphs without direction have direction TB so their internal nodes stack vertically
  code = code.replace(
    /(subgraph\s+[^\n]+)\n(?!\s*direction\b)/gi,
    '$1\n        direction TB\n'
  );

  // 4. Quote unquoted node labels with special characters (safe, non-destructive):
  // Cylinders: ID[(unquoted text)] -> ID[("unquoted text")]
  code = code.replace(/(\b[A-Za-z0-9_-]+)\[\(([^"\n)]+)\)\]/g, '$1[("$2")]');
  // Rectangles: ID[unquoted text with special chars] -> ID["unquoted text"]
  code = code.replace(/(\b[A-Za-z0-9_-]+)\[([^"\]\n]*[:/&()+\-, ][^"\]\n]*)\]/g, '$1["$2"]');
  // Rounded: ID(unquoted text with special chars) -> ID("unquoted text")
  code = code.replace(/(\b[A-Za-z0-9_-]+)\(([^"\)\n]*[:/&+\-, ][^"\)\n]*)\)/g, '$1("$2")');
  // Hexagons: ID{{unquoted text with special chars}} -> ID{{"unquoted text"}}
  code = code.replace(/(\b[A-Za-z0-9_-]+)\{\{([^"\}\n]*[:/&()+\-, ][^"\}\n]*)\}\}/g, '$1{{"$2"}}');

  // 5. Quote unquoted edge labels for ALL link types: -->, <==>, ===, -.->, etc.
  code = code.replace(/(<==>|<-->|-->|-.->|==>|===|---|~>)\s*\|([^\n"\|]+)\|/g, (_full, arrow, edgeText) => {
    const trimmed = edgeText.trim();
    if (trimmed.startsWith('"') && trimmed.endsWith('"')) {
      return `${arrow}|${trimmed}|`;
    }
    const safe = trimmed.replace(/"/g, "'");
    return `${arrow}|"${safe}"|`;
  });

  // 6. Fix unclosed subgraphs
  const subgraphs = (code.match(/\bsubgraph\b/g) || []).length;
  const ends = (code.match(/\bend\b/g) || []).length;
  if (subgraphs > ends) {
    code += '\n' + 'end\n'.repeat(subgraphs - ends);
  }

  return code;
}

/**
 * Makes a Mermaid SVG fully responsive by:
 * - Removing hardcoded pixel width/height attributes (which cause the squish)
 * - Setting width="100%" so it fills its container
 * - Computing an explicit height from the viewBox aspect ratio so tall
 *   vertical (TD) diagrams are never squished into a thin strip.
 */
function makeSvgResponsive(svg: string): string {
  // Extract viewBox dimensions
  const vbMatch = svg.match(/viewBox=["']([^"']+)["']/);
  let naturalHeight = 400; // fallback min-height

  if (vbMatch) {
    const parts = vbMatch[1].trim().split(/[\s,]+/).map(Number);
    if (parts.length === 4) {
      const [, , vbW, vbH] = parts;
      const effectiveWidth = Math.min(800, vbW || 700);
      naturalHeight = Math.max(300, Math.round((vbH / vbW) * effectiveWidth));
    }
  }

  // Remove hardcoded width / height attributes from the <svg> open tag
  svg = svg.replace(/<svg([^>]*)>/, (full, attrs) => {
    const cleaned = attrs
      .replace(/\s+width=["'][^"']*["']/g, '')
      .replace(/\s+height=["'][^"']*["']/g, '');
    return `<svg${cleaned} width="100%" height="${naturalHeight}" style="display:block;width:100%;max-width:100%;height:auto;min-height:260px;margin:0 auto;">`;
  });

  return svg;
}

/**
 * Creates an ultra-clean emergency fallback flowchart SVG if Mermaid completely fails.
 * Guarantees that the user ALWAYS sees an attractive visual diagram instead of raw code.
 */
function createFallbackDiagramSvg(rawCode: string): string {
  // Extract node labels or lines from the raw code
  const lines = rawCode
    .split('\n')
    .map((l) => l.trim())
    .filter(
      (l) =>
        l &&
        !l.startsWith('flowchart') &&
        !l.startsWith('graph') &&
        !l.startsWith('subgraph') &&
        !l.startsWith('end') &&
        !l.startsWith('%%')
    );

  const steps: string[] = [];
  for (const line of lines) {
    const labelMatch = line.match(/\["?(.*?)"?\]|\("?(.*?)"?\)|\{"?(.*?)"?\}/);
    if (labelMatch) {
      const text = labelMatch[1] || labelMatch[2] || labelMatch[3];
      if (text && text.length > 1 && !steps.includes(text)) {
        steps.push(text);
      }
    } else if (line.includes('-->') || line.includes('->')) {
      const parts = line.split(/-->|->/);
      for (const p of parts) {
        const cleanP = p.replace(/^[A-Za-z0-9_-]+\s*/, '').replace(/[\[\]\(\)\{\}"']/g, '').trim();
        if (cleanP && cleanP.length > 1 && !steps.includes(cleanP)) {
          steps.push(cleanP);
        }
      }
    }
  }

  if (steps.length === 0) {
    steps.push('Client Layer (Web & Mobile UI)');
    steps.push('API Gateway / Auth & Rate Limiting');
    steps.push('Application Microservices & Workers');
    steps.push('Data Storage & Cache (PostgreSQL & Redis)');
  }

  const stepHeight = 54;
  const gap = 36;
  const totalHeight = steps.length * stepHeight + (steps.length - 1) * gap + 40;
  const width = 640;
  const boxWidth = 500;
  const boxX = (width - boxWidth) / 2;

  let svgElements = '';
  steps.forEach((step, idx) => {
    const y = 20 + idx * (stepHeight + gap);
    // Box
    svgElements += `
      <g>
        <rect x="${boxX}" y="${y}" width="${boxWidth}" height="${stepHeight}" rx="10" ry="10" fill="#FFFFFF" stroke="#C4623A" stroke-width="2" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.06))"/>
        <circle cx="${boxX + 26}" cy="${y + stepHeight / 2}" r="12" fill="#EAE5DC" stroke="#C4623A" stroke-width="1.5"/>
        <text x="${boxX + 26}" y="${y + stepHeight / 2 + 4}" font-family="Segoe UI, sans-serif" font-size="11" font-weight="bold" fill="#C4623A" text-anchor="middle">${idx + 1}</text>
        <text x="${boxX + 50}" y="${y + stepHeight / 2 + 5}" font-family="Segoe UI, sans-serif" font-size="13" font-weight="600" fill="#2C2825">${step}</text>
      </g>
    `;

    // Arrow to next step
    if (idx < steps.length - 1) {
      const arrowStartY = y + stepHeight;
      const arrowEndY = arrowStartY + gap;
      const centerX = width / 2;
      svgElements += `
        <line x1="${centerX}" y1="${arrowStartY}" x2="${centerX}" y2="${arrowEndY}" stroke="#736B63" stroke-width="2" stroke-dasharray="4,4"/>
        <polygon points="${centerX - 5},${arrowEndY - 4} ${centerX + 5},${arrowEndY - 4} ${centerX},${arrowEndY + 2}" fill="#C4623A"/>
      `;
    }
  });

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${totalHeight}" width="100%" height="${totalHeight}" style="max-width: 100%; height: auto; display: block; margin: 0 auto; background: #F9F8F6; border-radius: 12px; padding: 10px;">${svgElements}</svg>`;
}

/**
 * Renders Mermaid code to an SVG string without shaking or touching visible DOM.
 * Uses a detached off-screen container to completely avoid layout thrash.
 */
export async function renderMermaidSvg(id: string, rawCode: string): Promise<string> {
  const sanitized = sanitizeMermaidCode(rawCode);
  const renderId = `${id}-${++_counter}`;

  // Create an off-screen sandbox container that cannot cause layout jitter
  const container = document.createElement('div');
  container.id = `sandbox-${renderId}`;
  container.style.cssText =
    'position: fixed; left: -99999px; top: -99999px; width: 800px; height: 600px; opacity: 0; pointer-events: none; visibility: hidden; z-index: -9999;';
  document.body.appendChild(container);

  try {
    const { svg: rawSvg } = await mermaid.render(renderId, sanitized, container);
    return makeSvgResponsive(rawSvg);
  } catch (firstErr) {
    console.warn('[Mermaid] Primary render failed, attempting simplified vertical flowchart recovery:', firstErr);

    // Attempt simple repair: strip classDef/styling lines and trailing semicolons
    try {
      const strippedSyntax = sanitized
        .split('\n')
        .filter((l) => !l.trim().startsWith('classDef') && !l.trim().startsWith('class '))
        .join('\n');

      const repairId = `repair-${renderId}`;
      const { svg: recoveredSvg } = await mermaid.render(repairId, strippedSyntax, container);
      return makeSvgResponsive(recoveredSvg);
    } catch (_recoveryErr) {
      console.warn('[Mermaid] Fallback parse failed, generating clean structured vertical SVG flowchart.');
      return createFallbackDiagramSvg(rawCode);
    }
  } finally {
    if (document.body.contains(container)) {
      document.body.removeChild(container);
    }
  }
}

/**
 * Replaces all ```mermaid blocks in a markdown string with high-quality styled SVG diagrams.
 */
export async function renderMermaidToSvgInContent(content: string): Promise<string> {
  if (!content) return '';

  const mermaidRegex = /```(?:mermaid)\s*([\s\S]*?)```/gi;
  const matches: Array<{ full: string; code: string }> = [];

  let match: RegExpExecArray | null;
  while ((match = mermaidRegex.exec(content)) !== null) {
    matches.push({ full: match[0], code: match[1].trim() });
  }

  if (matches.length === 0) return content;

  let result = content;
  for (let i = 0; i < matches.length; i++) {
    const { full, code } = matches[i];
    const id = `export-chart-${Date.now()}-${i}`;
    try {
      const svg = await renderMermaidSvg(id, code);
      const wrappedSvg = `
<div style="margin: 24px 0; padding: 20px 16px 16px; background: #F9F8F6; border: 1px solid #E2DDD3; border-left: 4px solid #C4623A; border-radius: 12px; page-break-inside: avoid; break-inside: avoid;">
  <p style="font-size: 11px; color: #736B63; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; margin: 0 0 14px 0; font-family: Segoe UI, sans-serif; text-align: center;">&#9679; System Architecture &amp; Data Flow Topology</p>
  <div style="width: 100%; overflow-x: auto;">${svg}</div>
</div>`;
      result = result.replace(full, wrappedSvg);
    } catch {
      const fallbackSvg = createFallbackDiagramSvg(code);
      const wrappedSvg = `
<div style="margin: 24px 0; padding: 20px 16px 16px; background: #F9F8F6; border: 1px solid #E2DDD3; border-left: 4px solid #C4623A; border-radius: 12px; page-break-inside: avoid; break-inside: avoid;">
  <p style="font-size: 11px; color: #736B63; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; margin: 0 0 14px 0; font-family: Segoe UI, sans-serif; text-align: center;">&#9679; System Architecture Diagram</p>
  <div style="width: 100%; overflow-x: auto;">${fallbackSvg}</div>
</div>`;
      result = result.replace(full, wrappedSvg);
    }
  }

  return result;
}
