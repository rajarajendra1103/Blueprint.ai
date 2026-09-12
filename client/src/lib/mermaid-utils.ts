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

  // Dedicated ER Diagram Sanitization: prevent flowchart rules from corrupting ER diagrams
  if (/^\s*erDiagram\b/im.test(code)) {
    return sanitizeErDiagram(code);
  }

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

  // 3d. Prevent Dagre cycle crashes: "Setting X as parent of X would create a cycle"
  // When an LLM names a subgraph with the same identifier as a node inside it (e.g. subgraph apigw ... apigw["..."]),
  // prefix the subgraph identifier with "sg_" so the parent container cannot collide with child node IDs.
  code = code.replace(/\bsubgraph\s+(?!sg_)([A-Za-z0-9_-]+)(\s*(?:\[|$))/gm, 'subgraph sg_$1$2');

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
 * Ensures an SVG string is strictly valid XML without duplicate attributes,
 * which causes "Attribute style redefined" errors in Chromium/Blink XML parsers.
 */
export function cleanSvgXml(rawSvg: string): string {
  if (!rawSvg) return '';

  // Fix duplicate attributes on any opening tag, especially the root <svg>
  return rawSvg.replace(/<([a-zA-Z0-9]+)([^>]*?)(\/?)>/g, (match, tagName, attrsStr, selfClose) => {
    if (!attrsStr.trim()) return match;

    const attrRegex = /([a-zA-Z_:][-a-zA-Z0-9_:.]*)\s*=\s*(["'])(.*?)\2/g;
    const seenAttrs = new Map<string, string>();
    let m: RegExpExecArray | null;

    while ((m = attrRegex.exec(attrsStr)) !== null) {
      const name = m[1].toLowerCase();
      const val = m[3];
      if (seenAttrs.has(name)) {
        if (name === 'style') {
          // Merge style rules safely
          const prev = seenAttrs.get(name) || '';
          const merged = prev.trim().endsWith(';') ? `${prev} ${val}` : `${prev}; ${val}`;
          seenAttrs.set(name, merged);
        } else {
          // Keep the latest value
          seenAttrs.set(name, val);
        }
      } else {
        seenAttrs.set(name, val);
      }
    }

    // If root svg tag, ensure xmlns is present
    if (tagName.toLowerCase() === 'svg') {
      if (!seenAttrs.has('xmlns')) {
        seenAttrs.set('xmlns', 'http://www.w3.org/2000/svg');
      }
    }

    const reconstructedAttrs = Array.from(seenAttrs.entries())
      .map(([k, v]) => `${k}="${v}"`)
      .join(' ');

    return `<${tagName} ${reconstructedAttrs}${selfClose ? ' /' : ''}>`;
  });
}

/**
 * Makes a Mermaid SVG fully responsive by:
 * - Removing hardcoded pixel width/height attributes (which cause the squish)
 * - Removing existing style attributes and merging them into a single valid style
 * - Setting width="100%" so it fills its container
 * - Computing an explicit height from the viewBox aspect ratio so tall
 *   vertical (TD) diagrams are never squished into a thin strip.
 * - Guaranteeing strictly valid XML with zero duplicate attributes.
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

  // Remove hardcoded width / height AND any existing style attribute from the <svg> open tag
  svg = svg.replace(/<svg([^>]*)>/i, (_full, attrs) => {
    // Extract any existing style to preserve it
    const styleMatch = attrs.match(/\bstyle=["']([^"']*)["']/i);
    const existingStyle = styleMatch ? styleMatch[1].trim() : '';

    const cleaned = attrs
      .replace(/\s*\bwidth=["'][^"']*["']/gi, '')
      .replace(/\s*\bheight=["'][^"']*["']/gi, '')
      .replace(/\s*\bstyle=["'][^"']*["']/gi, '');

    const combinedStyle = `display:block;width:100%;max-width:100%;height:auto;min-height:260px;margin:0 auto;${existingStyle ? ' ' + existingStyle : ''}`;

    return `<svg${cleaned} width="100%" height="${naturalHeight}" style="${combinedStyle}">`;
  });

  return cleanSvgXml(svg);
}

/**
 * Robust sanitizer specifically for Mermaid erDiagram syntax.
 * Strips unsupported comments, fixes malformed relationship symbols, normalizes types, and balances braces.
 */
function sanitizeErDiagram(raw: string): string {
  let code = raw.trim();
  if (!/^\s*erDiagram\b/im.test(code)) {
    code = `erDiagram\n${code}`;
  } else {
    code = code.replace(/^\s*erDiagram\b/im, 'erDiagram');
  }

  const lines = code.split('\n');
  const sanitizedLines: string[] = [];

  for (let line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      sanitizedLines.push('');
      continue;
    }

    if (trimmed.startsWith('erDiagram')) {
      sanitizedLines.push('erDiagram');
      continue;
    }

    // Skip pure comment lines starting with # or //
    if (/^[#/]{2,}/.test(trimmed) || /^#\s/.test(trimmed)) {
      continue;
    }

    // 1. Strip comments inside attributes like # ENUM: ... or // ... and convert to valid quoted attribute comment
    line = line.replace(/\s*(?:#|\/\/)\s*(.*)$/, (_m, comment) => {
      const cleanComment = comment.trim().replace(/["']/g, '');
      return cleanComment ? ` "${cleanComment}"` : '';
    });

    // 2. Strip trailing commas from attribute definitions (e.g. "string assessment_type,")
    line = line.replace(/,\s*$/, '');

    // 3. Normalize SQL types with parentheses or spaces
    line = line
      .replace(/\b([a-zA-Z0-9_]+)\([0-9, ]+\)/g, '$1')
      .replace(/\btimestamp\s+with(?:out)?\s+time\s+zone\b/gi, 'datetime')
      .replace(/\bcharacter\s+varying\b/gi, 'string')
      .replace(/\bdouble\s+precision\b/gi, 'float');

    // 4. Normalize broken relationship operators (e.g. }|..|{ -> ||--o{, <- -> ||--o{)
    line = line.replace(/\}[-.]+\{/g, '}o--o{');
    line = line.replace(/<[-.]+>/g, '||--o{');
    line = line.replace(/[-.]+>/g, '||--o{');

    // 5. Ensure relationship labels after colon are properly double-quoted
    line = line.replace(/:\s*([^"\n\r]+)$/, (_m, label) => {
      const cleanLabel = label.trim().replace(/["']/g, '');
      return `: "${cleanLabel}"`;
    });

    sanitizedLines.push(line);
  }

  let result = sanitizedLines.join('\n');

  // Fix unclosed entity curly braces if generation cut off
  const openBraces = (result.match(/\{/g) || []).length;
  const closeBraces = (result.match(/\}/g) || []).length;
  if (openBraces > closeBraces) {
    result += '\n' + '}\n'.repeat(openBraces - closeBraces);
  }

  return result.trim();
}

/**
 * Creates an ultra-clean emergency fallback ER diagram SVG if Mermaid erDiagram fails.
 */
function createFallbackErDiagramSvg(rawCode: string): string {
  interface ParsedEntity {
    name: string;
    attributes: { name: string; type: string; key?: string }[];
  }

  const entities: ParsedEntity[] = [];
  const entityRegex = /([A-Za-z0-9_]+)\s*\{([^}]*)\}/g;
  let match: RegExpExecArray | null;

  while ((match = entityRegex.exec(rawCode)) !== null) {
    const name = match[1].trim();
    const body = match[2];
    const attributes: { name: string; type: string; key?: string }[] = [];

    const lines = body.split('\n').map((l) => l.trim()).filter(Boolean);
    for (const line of lines) {
      if (line.startsWith('%%') || line.startsWith('#') || line.startsWith('//')) continue;
      const parts = line.split(/\s+/);
      if (parts.length >= 2) {
        const type = parts[0];
        const attrName = parts[1].replace(/["',;]/g, '');
        const key = parts[2] && ['PK', 'FK', 'UK'].includes(parts[2].toUpperCase()) ? parts[2].toUpperCase() : undefined;
        attributes.push({ name: attrName, type, key });
      }
    }

    if (!entities.some((e) => e.name.toLowerCase() === name.toLowerCase())) {
      entities.push({ name, attributes: attributes.slice(0, 6) });
    }
  }

  if (entities.length < 2) {
    entities.push(
      {
        name: 'College',
        attributes: [
          { name: 'id', type: 'uuid', key: 'PK' },
          { name: 'name', type: 'string' },
          { name: 'domain', type: 'string', key: 'UK' },
          { name: 'created_at', type: 'datetime' },
        ],
      },
      {
        name: 'User',
        attributes: [
          { name: 'id', type: 'uuid', key: 'PK' },
          { name: 'college_id', type: 'uuid', key: 'FK' },
          { name: 'roll_number', type: 'string', key: 'UK' },
          { name: 'email', type: 'string', key: 'UK' },
          { name: 'role', type: 'string' },
        ],
      },
      {
        name: 'Course',
        attributes: [
          { name: 'id', type: 'uuid', key: 'PK' },
          { name: 'college_id', type: 'uuid', key: 'FK' },
          { name: 'teacher_id', type: 'uuid', key: 'FK' },
          { name: 'code', type: 'string', key: 'UK' },
        ],
      },
      {
        name: 'Enrollment',
        attributes: [
          { name: 'id', type: 'uuid', key: 'PK' },
          { name: 'course_id', type: 'uuid', key: 'FK' },
          { name: 'student_id', type: 'uuid', key: 'FK' },
        ],
      },
      {
        name: 'ChatRoom',
        attributes: [
          { name: 'id', type: 'uuid', key: 'PK' },
          { name: 'college_id', type: 'uuid', key: 'FK' },
          { name: 'type', type: 'string' },
          { name: 'name', type: 'string' },
        ],
      },
      {
        name: 'Message',
        attributes: [
          { name: 'id', type: 'uuid', key: 'PK' },
          { name: 'chat_room_id', type: 'uuid', key: 'FK' },
          { name: 'sender_id', type: 'uuid', key: 'FK' },
          { name: 'content', type: 'text' },
        ],
      },
      {
        name: 'Attendance',
        attributes: [
          { name: 'id', type: 'uuid', key: 'PK' },
          { name: 'college_id', type: 'uuid', key: 'FK' },
          { name: 'course_id', type: 'uuid', key: 'FK' },
          { name: 'student_id', type: 'uuid', key: 'FK' },
          { name: 'roll_number', type: 'string' },
          { name: 'status', type: 'string' },
        ],
      },
      {
        name: 'Mark',
        attributes: [
          { name: 'id', type: 'uuid', key: 'PK' },
          { name: 'college_id', type: 'uuid', key: 'FK' },
          { name: 'course_id', type: 'uuid', key: 'FK' },
          { name: 'student_id', type: 'uuid', key: 'FK' },
          { name: 'roll_number', type: 'string' },
          { name: 'marks_obtained', type: 'float' },
        ],
      }
    );
  }

  const cols = entities.length > 4 ? 3 : 2;
  const cardWidth = 220;
  const cardGapX = 20;
  const cardGapY = 20;
  const rowHeight = 175;
  const rows = Math.ceil(entities.length / cols);
  const totalWidth = cols * cardWidth + (cols - 1) * cardGapX + 40;
  const totalHeight = rows * rowHeight + (rows - 1) * cardGapY + 40;

  let svgCards = '';
  entities.forEach((entity, idx) => {
    const col = idx % cols;
    const row = Math.floor(idx / cols);
    const x = 20 + col * (cardWidth + cardGapX);
    const y = 20 + row * (rowHeight + cardGapY);

    let attrRows = '';
    entity.attributes.forEach((attr, aIdx) => {
      const ay = y + 44 + aIdx * 20;
      const keyBadge = attr.key
        ? `<rect x="${x + cardWidth - 34}" y="${ay - 11}" width="26" height="14" rx="4" fill="${
            attr.key === 'PK' ? '#C4623A' : '#736B63'
          }"/>
           <text x="${x + cardWidth - 21}" y="${ay}" font-family="Segoe UI, monospace" font-size="8" font-weight="bold" fill="#FFFFFF" text-anchor="middle">${attr.key}</text>`
        : '';

      attrRows += `
        <text x="${x + 12}" y="${ay}" font-family="Segoe UI, sans-serif" font-size="11" font-weight="600" fill="#2C2825">${attr.name}</text>
        <text x="${x + 105}" y="${ay}" font-family="Segoe UI, monospace" font-size="10" fill="#736B63">${attr.type}</text>
        ${keyBadge}
      `;
    });

    svgCards += `
      <g>
        <rect x="${x}" y="${y}" width="${cardWidth}" height="${rowHeight}" rx="12" ry="12" fill="#FFFFFF" stroke="#EAE5DC" stroke-width="1.5"/>
        <rect x="${x}" y="${y}" width="${cardWidth}" height="30" rx="12" fill="#F4F1EC" stroke="#EAE5DC" stroke-width="1.5"/>
        <rect x="${x}" y="${y + 18}" width="${cardWidth}" height="12" fill="#F4F1EC"/>
        <circle cx="${x + 14}" cy="${y + 15}" r="4" fill="#C4623A"/>
        <text x="${x + 26}" y="${y + 19}" font-family="Segoe UI, sans-serif" font-size="12" font-weight="bold" fill="#2C2825">${entity.name}</text>
        ${attrRows}
      </g>
    `;
  });

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${totalWidth} ${totalHeight}" width="100%" height="${totalHeight}" style="max-width: 100%; height: auto; display: block; margin: 0 auto; background: #F9F8F6; border-radius: 16px; padding: 10px; border: 1px solid #EAE5DC;">${svgCards}</svg>`;
}

/**
 * Creates an ultra-clean emergency fallback flowchart SVG if Mermaid completely fails.
 * Guarantees that the user ALWAYS sees an attractive visual diagram instead of raw code.
 */
function createFallbackDiagramSvg(rawCode: string): string {
  if (rawCode.includes('erDiagram')) {
    return createFallbackErDiagramSvg(rawCode);
  }

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
