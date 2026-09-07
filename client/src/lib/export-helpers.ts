import { marked } from 'marked';
import { renderMermaidToSvgInContent } from './mermaid-utils';

export { renderMermaidToSvgInContent };

// ─── File Download Utilities ───────────────────────────────────────────────

export function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.setAttribute('download', filename);
  a.download = filename;
  a.style.display = 'none';
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    try {
      if (document.body.contains(a)) document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {}
  }, 20000);
}

export function downloadMarkdown(markdown: string, filename: string = 'blueprint-specification.md'): void {
  const safeFilename = filename.endsWith('.md') ? filename : `${filename}.md`;
  downloadFile(markdown, safeFilename, 'text/markdown;charset=utf-8');
}

export function downloadJson(data: any, filename: string = 'blueprint-specification.json'): void {
  const safeFilename = filename.endsWith('.json') ? filename : `${filename}.json`;
  downloadFile(JSON.stringify(data, null, 2), safeFilename, 'application/json;charset=utf-8');
}

// ─── Word Document (.doc) Export ──────────────────────────────────────────

export async function downloadWordDoc(data: {
  idea: string;
  classification: any;
  specDoc: any;
  selectedTechStack?: any;
  selectedDesign?: any;
}, filename?: string): Promise<void> {
  const { idea, classification, specDoc, selectedTechStack, selectedDesign } = data;
  const now = new Date().toLocaleDateString('en-US', { dateStyle: 'long' });

  const safeSlug = (idea || 'blueprint')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .slice(0, 35);
  const targetFilename = filename || `${safeSlug || 'blueprint'}-specification.doc`;

  let html = `<!DOCTYPE html>
<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
<head>
<meta charset='utf-8'>
<title>${classification?.domain || 'Software'} Architecture Specification - Blueprint.ai</title>
<!--[if gte mso 9]>
<xml>
  <w:WordDocument>
    <w:View>Print</w:View>
    <w:Zoom>100</w:Zoom>
    <w:DoNotOptimizeForBrowser/>
  </w:WordDocument>
</xml>
<![endif]-->
<style>
  body { font-family: 'Segoe UI', Calibri, Arial, sans-serif; font-size: 11pt; line-height: 1.6; color: #2C2825; background-color: #FFFFFF; margin: 40pt; }
  h1 { font-family: 'Georgia', 'Times New Roman', serif; font-size: 22pt; color: #C4623A; border-bottom: 2pt solid #C4623A; padding-bottom: 6pt; margin-bottom: 12pt; }
  h2 { font-family: 'Georgia', 'Times New Roman', serif; font-size: 15pt; color: #2C2825; border-bottom: 1pt solid #E2DDD3; padding-bottom: 4pt; margin-top: 24pt; margin-bottom: 8pt; }
  h3 { font-size: 12.5pt; color: #C4623A; margin-top: 16pt; margin-bottom: 6pt; }
  p, li { font-size: 10.5pt; line-height: 1.6; color: #2C2825; }
  .meta-box { background-color: #F4F1EC; border: 1pt solid #E7E2D8; padding: 12pt; margin-bottom: 20pt; }
  table { border-collapse: collapse; width: 100%; margin: 12pt 0; }
  th, td { border: 1pt solid #D1D5DB; padding: 6pt 10pt; text-align: left; font-size: 10pt; }
  th { background-color: #EFECE6; font-weight: bold; color: #2C2825; }
  tr:nth-child(even) { background-color: #F9F7F4; }
  pre, code { font-family: 'Consolas', 'Courier New', monospace; font-size: 9.5pt; background-color: #F0EDE8; color: #1A1A2E; }
  pre { padding: 10pt; border: 1pt solid #D1CAC0; border-left: 3pt solid #C4623A; }
  svg { max-width: 100%; height: auto; }
</style>
</head>
<body>
  <h1>Product Requirements &amp; Technical Architecture Specification</h1>
  <div class="meta-box">
    <p><strong>Project Concept:</strong> ${idea}</p>
    <p><strong>Date Generated:</strong> ${now}</p>
    <p><strong>Domain:</strong> ${classification?.domain || 'Software'} | <strong>Platform:</strong> ${classification?.platform || 'Web'} | <strong>Complexity:</strong> ${classification?.complexityTier || 'Standard'}</p>
    <p><strong>Target Audience:</strong> ${classification?.targetAudience || 'General Users'}</p>
  </div>
`;

  if (selectedTechStack) {
    html += `
  <h2>1. Approved Production Technology Stack</h2>
  <table>
    <tr><th>Architecture Tier</th><th>Selected Technology</th></tr>
    <tr><td><strong>Frontend</strong></td><td>${selectedTechStack.frontend}</td></tr>
    <tr><td><strong>Backend</strong></td><td>${selectedTechStack.backend}</td></tr>
    <tr><td><strong>Database</strong></td><td>${selectedTechStack.database}</td></tr>
    <tr><td><strong>Styling &amp; UI</strong></td><td>${selectedTechStack.styling}</td></tr>
    <tr><td><strong>Cloud Deployment</strong></td><td>${selectedTechStack.deployment}</td></tr>
  </table>
`;
  }

  if (selectedDesign) {
    html += `
  <h2>2. Visual Design System &amp; Layout Direction</h2>
  <div class="meta-box">
    <h3>${selectedDesign.name} (${selectedDesign.badge})</h3>
    <p><em>${selectedDesign.philosophy}</em></p>
    <p><strong>Layout:</strong> ${selectedDesign.layout?.style || 'Structured'} — Density: ${selectedDesign.layout?.density || 'Balanced'} — Grid: ${selectedDesign.layout?.gridSystem || '12-column'}</p>
    <p><strong>Typography:</strong> Headings: ${selectedDesign.typography?.headingFont || 'System'} | Body: ${selectedDesign.typography?.bodyFont || 'System'}</p>
    <p><strong>Colors:</strong> Base: ${selectedDesign.colors?.base} | Primary: ${selectedDesign.colors?.primary} | Accent: ${selectedDesign.colors?.accent}</p>
    <p><strong>Accessibility:</strong> ${selectedDesign.accessibilityNotes || 'WCAG AA Compliant'} (${selectedDesign.contrastRating || 'AAA'})</p>
  </div>
`;
  }

  html += `<h2>3. Detailed Technical Architecture &amp; PRD Specifications</h2>`;
  if (specDoc && specDoc.sections) {
    for (const sec of Object.values(specDoc.sections) as any[]) {
      // Render mermaid diagrams to actual SVG for embedding in the doc
      const contentWithSvg = await renderMermaidToSvgInContent(sec.content || '');
      const parsedHtml = marked.parse(contentWithSvg, { gfm: true, breaks: true });
      html += `
    <div style="margin-top: 20pt;">
      <h3>${sec.title}</h3>
      <p style="font-size: 10pt; color: #736B63; font-style: italic;">${sec.description || ''}</p>
      ${parsedHtml}
    </div>
    <hr style="border: 0; border-top: 1pt solid #E2DDD3; margin: 18pt 0;" />
`;
    }
  }

  html += `
  <p style="font-size: 9pt; color: #736B63; text-align: center; margin-top: 30pt;">
    Generated by Blueprint.ai — AI-Powered Architectural Specification &amp; Design System Generator.
  </p>
</body>
</html>
`;

  downloadFile(html, targetFilename, 'application/msword;charset=utf-8');
}

// ─── Standalone Document Page (HTML / PDF Ready) ──────────────────────────

export async function generateDocumentHtml(data: {
  idea: string;
  classification: any;
  specDoc: any;
  selectedTechStack?: any;
  selectedDesign?: any;
}): Promise<string> {
  const { idea, classification, specDoc, selectedTechStack, selectedDesign } = data;
  const now = new Date().toLocaleDateString('en-US', { dateStyle: 'long' });

  // Render all sections with SVG diagrams (async)
  let sectionsHtml = '';
  if (specDoc && specDoc.sections) {
    for (const sec of Object.values(specDoc.sections) as any[]) {
      const contentWithSvg = await renderMermaidToSvgInContent(sec.content || '');
      const parsedHtml = marked.parse(contentWithSvg, { gfm: true, breaks: true });
      sectionsHtml += `
      <section class="section-block">
        <h2 class="section-title">${sec.title}</h2>
        <p class="section-desc">${sec.description || ''}</p>
        <div class="section-body">${parsedHtml}</div>
      </section>
      `;
    }
  }

  const techStackHtml = selectedTechStack
    ? `
    <section class="section-block">
      <h2 class="section-title">Approved Production Technology Stack</h2>
      <table class="doc-table">
        <thead><tr><th>Architecture Tier</th><th>Selected Technology</th></tr></thead>
        <tbody>
          <tr><td><strong>Frontend</strong></td><td>${selectedTechStack.frontend}</td></tr>
          <tr><td><strong>Backend</strong></td><td>${selectedTechStack.backend}</td></tr>
          <tr><td><strong>Database</strong></td><td>${selectedTechStack.database}</td></tr>
          <tr><td><strong>Styling &amp; UI</strong></td><td>${selectedTechStack.styling}</td></tr>
          <tr><td><strong>Cloud Deployment</strong></td><td>${selectedTechStack.deployment}</td></tr>
        </tbody>
      </table>
    </section>
  `
    : '';

  const designHtml = selectedDesign
    ? `
    <section class="section-block">
      <h2 class="section-title">Visual Design System &amp; Layout Direction</h2>
      <div class="info-card">
        <h3 style="margin-top:0; color:#2C2825;">${selectedDesign.name} <span class="badge">${selectedDesign.badge}</span></h3>
        <p style="margin-top:4px;"><em>${selectedDesign.philosophy}</em></p>
        <p><strong>Layout Composition:</strong> ${selectedDesign.layout?.style || 'Structured'} — Density: ${selectedDesign.layout?.density || 'Balanced'} — Grid: ${selectedDesign.layout?.gridSystem || '12-column'}</p>
        <p><strong>Typography System:</strong> Headings: ${selectedDesign.typography?.headingFont || 'System'} | Body: ${selectedDesign.typography?.bodyFont || 'System'} | Monospace: ${selectedDesign.typography?.monoFont || 'Monospace'}</p>
        <p><strong>Curated Palette:</strong> Base: <code>${selectedDesign.colors?.base}</code> | Surface: <code>${selectedDesign.colors?.surface}</code> | Primary: <code>${selectedDesign.colors?.primary}</code> | Accent: <code>${selectedDesign.colors?.accent}</code></p>
        <p><strong>Iconography:</strong> ${selectedDesign.icons?.style || 'Clean'} (${selectedDesign.icons?.library || 'Lucide'}) — ${selectedDesign.icons?.description || ''}</p>
        <p><strong>Accessibility:</strong> ${selectedDesign.accessibilityNotes || 'WCAG AA Compliant'} (${selectedDesign.contrastRating || 'AAA'})</p>
      </div>
    </section>
  `
    : '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${idea} — Architecture Specification &amp; PRD</title>
  <style>
    @media print {
      .action-bar { display: none !important; }
      body { background: #fff !important; padding: 0 !important; margin: 0 !important; color: #111 !important; }
      .page-container { box-shadow: none !important; border: none !important; max-width: 100% !important; padding: 0 !important; margin: 0 !important; }
      @page { margin: 1.5cm; size: A4; }
      h1, h2, h3 { page-break-after: avoid; break-after: avoid; }
      table, pre, .section-block, .info-card { page-break-inside: avoid; break-inside: avoid; }
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      background: #F4F1EC;
      color: #2C2825;
      margin: 0;
      padding: 30px 20px 80px 20px;
      line-height: 1.6;
    }
    .action-bar {
      position: fixed; top: 15px; right: 20px;
      display: flex; gap: 10px; z-index: 9999;
      background: rgba(244, 241, 236, 0.95);
      backdrop-filter: blur(8px);
      padding: 8px 14px; border-radius: 16px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.15);
      border: 1px solid #E2DDD3;
    }
    .btn {
      cursor: pointer; border: none; border-radius: 10px;
      padding: 9px 16px; font-size: 13px; font-weight: 600;
      transition: all 0.2s; display: inline-flex; align-items: center; gap: 6px;
    }
    .btn-primary { background: #C4623A; color: #fff; }
    .btn-primary:hover { background: #AD522D; }
    .btn-secondary { background: #EFECE6; color: #2C2825; border: 1px solid #E2DDD3; }
    .btn-secondary:hover { background: #E5E0D6; }
    .page-container {
      max-width: 900px; margin: 0 auto;
      background: #FFFFFF; padding: 50px 60px;
      border-radius: 20px; box-shadow: 0 4px 30px rgba(0,0,0,0.06);
      border: 1px solid #ECE7DC;
    }
    h1.doc-title {
      font-size: 28px; color: #2C2825; margin-top: 0; margin-bottom: 8px;
      border-bottom: 2px solid #C4623A; padding-bottom: 12px;
    }
    .meta-card {
      background: #F4F1EC; border: 1px solid #E2DDD3;
      padding: 16px 20px; border-radius: 12px;
      margin-bottom: 30px; font-size: 13px;
    }
    .section-block { margin-top: 35px; padding-top: 25px; border-top: 1px solid #EFECE6; }
    h2.section-title { font-size: 20px; color: #C4623A; margin-top: 0; margin-bottom: 4px; }
    .section-desc { font-size: 12px; color: #736B63; font-style: italic; margin-top: 0; margin-bottom: 16px; }
    table { width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 13px; }
    th, td { border: 1px solid #E2DDD3; padding: 8px 12px; text-align: left; }
    th { background: #F4F1EC; font-weight: 600; color: #2C2825; }
    tr:nth-child(even) { background: #FAFAF8; }
    pre {
      background: #F0EDE8; color: #1A1A2E;
      padding: 14px; border-radius: 10px; overflow-x: auto;
      font-size: 12px; font-family: Consolas, Monaco, monospace;
      border: 1px solid #D1CAC0; border-left: 3px solid #C4623A;
    }
    code {
      font-family: Consolas, Monaco, monospace;
      background: #EFECE6; color: #1A1A2E;
      padding: 2px 5px; border-radius: 4px; font-size: 12px;
    }
    pre code { background: transparent; padding: 0; color: inherit; }
    svg { max-width: 100%; height: auto; }
    .badge {
      display: inline-block; padding: 2px 8px; border-radius: 9999px;
      font-size: 11px; font-weight: 600;
      background: #EAE5DC; color: #7A8B6F;
    }
    .info-card {
      background: #F9F8F6; border: 1px solid #E2DDD3;
      border-radius: 12px; padding: 18px;
    }
  </style>
</head>
<body>
  <div class="action-bar">
    <button class="btn btn-primary" onclick="window.print()">🖨️ Print / Save as PDF</button>
    <button class="btn btn-secondary" onclick="window.close()">✕ Close Page</button>
  </div>

  <div class="page-container">
    <h1 class="doc-title">${idea}</h1>
    <div class="meta-card">
      <p><strong>Executive Summary:</strong> ${classification?.summary || ''}</p>
      <p><strong>Domain:</strong> ${classification?.domain || 'Software'} &nbsp;|&nbsp; <strong>Platform:</strong> ${classification?.platform || 'Web'} &nbsp;|&nbsp; <strong>Complexity:</strong> ${classification?.complexityTier || 'Standard'}</p>
      <p><strong>Target Audience:</strong> ${classification?.targetAudience || 'General Users'} &nbsp;|&nbsp; <strong>Date:</strong> ${now}</p>
    </div>

    ${techStackHtml}
    ${designHtml}
    ${sectionsHtml}

    <footer style="margin-top: 50px; text-align: center; font-size: 11px; color: #736B63; border-top: 1px solid #EFECE6; padding-top: 20px;">
      Generated by Blueprint.ai — AI-Powered Architectural Specification &amp; Design System Generator.
    </footer>
  </div>
</body>
</html>`;
}

/**
 * Downloads the clean standalone document as a self-contained .html file.
 */
export async function downloadHtmlDocument(data: {
  idea: string;
  classification: any;
  specDoc: any;
  selectedTechStack?: any;
  selectedDesign?: any;
}, filename?: string): Promise<void> {
  const fullHtml = await generateDocumentHtml(data);
  const safeSlug = (data.idea || 'blueprint')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .slice(0, 35);
  downloadFile(fullHtml, filename || `${safeSlug}-specification.html`, 'text/html;charset=utf-8');
}

// ─── Split Document Section Groups ─────────────────────────────────────────

/** Product Requirements Document — business & product-facing sections */
export const PRD_SECTION_IDS = [
  'requirements',
  'businessLogic',
  'algorithms',
  'costEstimate',
  'testingStrategy',
  'riskAssumptions',
] as const;

/** Technical Architecture Document — engineering & infra sections */
export const ARCHITECTURE_SECTION_IDS = [
  'architecture',
  'dataModel',
  'apiEndpoints',
  'folderStructure',
  'techStack',
  'deployment',
  'security',
  'integrations',
] as const;

// ─── Split Document HTML Generator ─────────────────────────────────────────

/**
 * Generates a standalone HTML document from a specific subset of spec sections.
 * Mermaid diagrams are pre-rendered to SVG.
 */
async function generateSplitDocumentHtml(data: {
  idea: string;
  classification: any;
  specDoc: any;
  selectedTechStack?: any;
  selectedDesign?: any;
}, sectionIds: readonly string[], docTitle: string, accentColor: string): Promise<string> {
  const { idea, classification, specDoc, selectedTechStack, selectedDesign } = data;
  const now = new Date().toLocaleDateString('en-US', { dateStyle: 'long' });

  // Filter sections to only the requested IDs, in order
  const filteredSections: any[] = [];
  if (specDoc?.sections) {
    for (const id of sectionIds) {
      const sec = (specDoc.sections as Record<string, any>)[id];
      if (sec) filteredSections.push(sec);
    }
  }

  // Render each section (with Mermaid SVG)
  let sectionsHtml = '';
  for (const sec of filteredSections) {
    const contentWithSvg = await renderMermaidToSvgInContent(sec.content || '');
    const parsedHtml = marked.parse(contentWithSvg, { gfm: true, breaks: true });
    sectionsHtml += `
    <section class="section-block">
      <h2 class="section-title">${sec.title}</h2>
      <p class="section-desc">${sec.description || ''}</p>
      <div class="section-body">${parsedHtml}</div>
    </section>`;
  }

  // Include tech stack table only in Architecture doc
  const techStackHtml = (selectedTechStack && sectionIds.includes('techStack' as any))
    ? `<section class="section-block">
      <h2 class="section-title">Approved Production Technology Stack</h2>
      <table class="doc-table">
        <thead><tr><th>Tier</th><th>Selected Technology</th></tr></thead>
        <tbody>
          <tr><td><strong>Frontend</strong></td><td>${selectedTechStack.frontend}</td></tr>
          <tr><td><strong>Backend</strong></td><td>${selectedTechStack.backend}</td></tr>
          <tr><td><strong>Database</strong></td><td>${selectedTechStack.database}</td></tr>
          <tr><td><strong>Styling & UI</strong></td><td>${selectedTechStack.styling}</td></tr>
          <tr><td><strong>Cloud Deployment</strong></td><td>${selectedTechStack.deployment}</td></tr>
        </tbody>
      </table>
    </section>` : '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${idea} — ${docTitle}</title>
  <style>
    @media print {
      .action-bar { display: none !important; }
      body { background: #fff !important; padding: 0 !important; margin: 0 !important; }
      .page-container { box-shadow: none !important; border: none !important; max-width: 100% !important; padding: 0 !important; margin: 0 !important; }
      @page { margin: 1.5cm; size: A4; }
      h1, h2, h3 { page-break-after: avoid; break-after: avoid; }
      table, pre, .section-block { page-break-inside: avoid; break-inside: avoid; }
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;
      background: #F4F1EC; color: #2C2825; margin: 0;
      padding: 30px 20px 80px; line-height: 1.6;
    }
    .action-bar {
      position: fixed; top: 15px; right: 20px;
      display: flex; gap: 10px; z-index: 9999;
      background: rgba(244,241,236,0.95); backdrop-filter: blur(8px);
      padding: 8px 14px; border-radius: 16px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.15); border: 1px solid #E2DDD3;
    }
    .btn { cursor:pointer; border:none; border-radius:10px; padding:9px 16px; font-size:13px; font-weight:600; transition:all 0.2s; display:inline-flex; align-items:center; gap:6px; }
    .btn-primary { background: ${accentColor}; color:#fff; }
    .btn-secondary { background:#EFECE6; color:#2C2825; border:1px solid #E2DDD3; }
    .page-container { max-width:900px; margin:0 auto; background:#fff; padding:50px 60px; border-radius:20px; box-shadow:0 4px 30px rgba(0,0,0,0.06); border:1px solid #ECE7DC; }
    .doc-badge { display:inline-block; background:${accentColor}22; color:${accentColor}; border:1px solid ${accentColor}44; border-radius:999px; font-size:11px; font-weight:700; letter-spacing:0.06em; text-transform:uppercase; padding:3px 12px; margin-bottom:10px; }
    h1.doc-title { font-size:28px; color:#2C2825; margin-top:0; margin-bottom:8px; border-bottom:2px solid ${accentColor}; padding-bottom:12px; }
    .meta-card { background:#F4F1EC; border:1px solid #E2DDD3; padding:16px 20px; border-radius:12px; margin-bottom:30px; font-size:13px; }
    .section-block { margin-top:35px; padding-top:25px; border-top:1px solid #EFECE6; }
    h2.section-title { font-size:20px; color:${accentColor}; margin-top:0; margin-bottom:4px; }
    .section-desc { font-size:12px; color:#736B63; font-style:italic; margin-top:0; margin-bottom:16px; }
    table { width:100%; border-collapse:collapse; margin:16px 0; font-size:13px; }
    th, td { border:1px solid #E2DDD3; padding:8px 12px; text-align:left; }
    th { background:#F4F1EC; font-weight:600; color:#2C2825; }
    tr:nth-child(even) { background:#FAFAF8; }
    pre { background:#F0EDE8; color:#1A1A2E; padding:14px; border-radius:10px; overflow-x:auto; font-size:12px; font-family:Consolas, Monaco, monospace; border:1px solid #D1CAC0; border-left:3px solid ${accentColor}; }
    code { font-family:Consolas, Monaco, monospace; background:#EFECE6; color:#1A1A2E; padding:2px 5px; border-radius:4px; font-size:12px; }
    pre code { background:transparent; padding:0; color:inherit; }
    svg { max-width:100%; height:auto; }
    .doc-table th { background:#F4F1EC; }
  </style>
</head>
<body>
  <div class="action-bar">
    <button class="btn btn-primary" onclick="window.print()">🖨️ Save as PDF</button>
    <button class="btn btn-secondary" onclick="window.close()">✕ Close</button>
  </div>

  <div class="page-container">
    <span class="doc-badge">${docTitle}</span>
    <h1 class="doc-title">${idea}</h1>
    <div class="meta-card">
      <p><strong>Executive Summary:</strong> ${classification?.summary || ''}</p>
      <p><strong>Domain:</strong> ${classification?.domain || 'Software'} &nbsp;|&nbsp; <strong>Platform:</strong> ${classification?.platform || 'Web'} &nbsp;|&nbsp; <strong>Complexity:</strong> ${classification?.complexityTier || 'Standard'}</p>
      <p><strong>Target Audience:</strong> ${classification?.targetAudience || 'General Users'} &nbsp;|&nbsp; <strong>Date:</strong> ${now}</p>
    </div>

    ${techStackHtml}
    ${sectionsHtml}

    <footer style="margin-top:50px;text-align:center;font-size:11px;color:#736B63;border-top:1px solid #EFECE6;padding-top:20px;">
      Generated by Blueprint.ai — AI-Powered Architectural Specification &amp; Design System Generator.
    </footer>
  </div>
</body>
</html>`;
}

/**
 * Opens a specific split-document (PRD or Architecture) in a new window and
 * auto-triggers the print dialog. Mermaid diagrams are pre-rendered to SVG.
 */
export async function downloadSplitDocPdf(
  data: {
    idea: string;
    classification: any;
    specDoc: any;
    selectedTechStack?: any;
    selectedDesign?: any;
  },
  sectionIds: readonly string[],
  docTitle: string,
  accentColor: string,
  slug: string,
): Promise<void> {
  // Open synchronously to bypass popup blockers
  const win = window.open('about:blank', '_blank');
  if (!win) {
    alert('Your browser blocked the popup. Please allow popups for this site and try again.');
    return;
  }

  // Show loading state immediately
  try {
    win.document.open();
    win.document.write(`<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Preparing ${docTitle}…</title>
<style>*{box-sizing:border-box}body{background:#F4F1EC;color:#2C2825;font-family:-apple-system,sans-serif;display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;margin:0;padding:20px}.spinner{width:44px;height:44px;border:4px solid #E2DDD3;border-top-color:${accentColor};border-radius:50%;animation:spin 0.9s linear infinite;margin-bottom:22px}@keyframes spin{to{transform:rotate(360deg)}}h2{margin:0 0 8px;font-size:19px}p{margin:0;color:#736B63;font-size:14px}</style>
</head><body><div class="spinner"></div><h2>Compiling ${docTitle}…</h2><p>Rendering flowcharts and assembling sections…</p></body></html>`);
    win.document.close();
  } catch {}

  // Generate the section-filtered HTML with Mermaid SVGs pre-rendered
  const html = await generateSplitDocumentHtml(data, sectionIds, docTitle, accentColor);

  // Inject auto-print script (1.2 s delay for fonts/SVGs to paint)
  const printScript = `\n<script>(function(){function p(){try{window.focus();window.print();}catch(e){}}if(document.readyState==='complete'){setTimeout(p,1200);}else{window.addEventListener('load',function(){setTimeout(p,1200);});}})();</script>`;
  const finalHtml = html.replace('</body>', `${printScript}\n</body>`);

  try {
    if (win && !win.closed) {
      win.document.open();
      win.document.write(finalHtml);
      win.document.close();
      win.focus();
    }
  } catch (err) {
    console.error('[downloadSplitDocPdf] Window write failed, falling back to file download:', err);
    const safeSlug = (data.idea || 'blueprint').toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 30);
    downloadFile(finalHtml, `${safeSlug}-${slug}.html`, 'text/html;charset=utf-8');
  }
}

/**
 * Opens the full pipeline document (all sections) in a dedicated new window and
 * automatically triggers the print dialog so the user can "Save as PDF".
 * Mermaid diagrams are pre-rendered to SVG before writing to the window.
 */
export async function downloadFullPipelinePdf(data: {
  idea: string;
  classification: any;
  specDoc: any;
  selectedTechStack?: any;
  selectedDesign?: any;
}): Promise<void> {
  // Open window synchronously on the click event to bypass popup blockers
  const win = window.open('about:blank', '_blank');
  if (!win) {
    alert('Your browser blocked the popup. Please allow popups for this site and try again.');
    return;
  }

  // Show loading indicator immediately
  const loadingHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Preparing Full PDF…</title>
  <style>
    * { box-sizing: border-box; }
    body {
      background: #F4F1EC; color: #2C2825;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      display: flex; flex-direction: column; align-items: center;
      justify-content: center; min-height: 100vh; margin: 0; padding: 20px;
    }
    .spinner {
      width: 48px; height: 48px;
      border: 4px solid #E2DDD3; border-top-color: #C4623A;
      border-radius: 50%; animation: spin 0.9s linear infinite;
      margin-bottom: 24px;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
    h2 { margin: 0 0 8px 0; font-size: 20px; }
    p { margin: 0; color: #736B63; font-size: 14px; }
  </style>
</head>
<body>
  <div class="spinner"></div>
  <h2>Compiling Full Architecture Specification…</h2>
  <p>Rendering all Mermaid flowcharts and assembling all sections — this may take a moment.</p>
</body>
</html>`;

  try {
    win.document.open();
    win.document.write(loadingHtml);
    win.document.close();
  } catch {}

  // Generate the complete HTML with all Mermaid diagrams pre-rendered as SVG
  const fullHtml = await generateDocumentHtmlWithAutoPrint(data);

  try {
    if (win && !win.closed) {
      win.document.open();
      win.document.write(fullHtml);
      win.document.close();
      win.focus();
    }
  } catch (err) {
    console.error('[downloadFullPipelinePdf] Failed to write to window:', err);
    // Fallback: download as HTML file
    const safeSlug = (data.idea || 'blueprint').toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 35);
    downloadFile(fullHtml, `${safeSlug}-full-specification.html`, 'text/html;charset=utf-8');
  }
}

/**
 * Like generateDocumentHtml but injects an auto-print script so the browser
 * print dialog opens automatically when the page finishes loading.
 */
async function generateDocumentHtmlWithAutoPrint(data: {
  idea: string;
  classification: any;
  specDoc: any;
  selectedTechStack?: any;
  selectedDesign?: any;
}): Promise<string> {
  const html = await generateDocumentHtml(data);
  // Inject auto-print before </body>: waits 1.2 s for fonts/SVGs to paint
  const printScript = `
<script>
  (function() {
    function triggerPrint() {
      try {
        window.focus();
        window.print();
      } catch(e) {
        console.warn('Auto-print blocked, user can use the button above.', e);
      }
    }
    if (document.readyState === 'complete') {
      setTimeout(triggerPrint, 1200);
    } else {
      window.addEventListener('load', function() { setTimeout(triggerPrint, 1200); });
    }
  })();
</script>`;
  return html.replace('</body>', `${printScript}\n</body>`);
}

/**
 * Opens the clean document in a new browser tab.
 * Accepts an optional pre-opened window reference to defeat aggressive browser popup blockers.
 */
export async function openDocumentPage(
  data: {
    idea: string;
    classification: any;
    specDoc: any;
    selectedTechStack?: any;
    selectedDesign?: any;
  },
  preOpenedWindow?: Window | null
): Promise<boolean> {
  const win = preOpenedWindow || window.open('', '_blank');
  if (win && !preOpenedWindow) {
    try {
      win.document.open();
      win.document.write(`
        <!DOCTYPE html><html><head><title>Loading Document...</title>
        <style>body{background:#F4F1EC;color:#2C2825;font-family:sans-serif;display:flex;flex-direction:column;align-items:center;justify-content:center;height:100vh;margin:0;}</style>
        </head><body><h3>Compiling Architecture Specification &amp; Diagrams...</h3><p style="color:#736B63">Rendering vector flowcharts and tables...</p></body></html>
      `);
      win.document.close();
    } catch {}
  }

  const fullHtml = await generateDocumentHtml(data);
  try {
    if (win && !win.closed) {
      win.document.open();
      win.document.write(fullHtml);
      win.document.close();
      win.focus();
      return true;
    }
  } catch (err) {
    console.error('Failed to open window via document.write:', err);
  }
  return false;
}

/**
 * Directly prints ONLY the clean document via a hidden iframe.
 * Eliminates screen captures, app headers, steppers, and repeating modal bars.
 */
export async function printCleanDocument(data: {
  idea: string;
  classification: any;
  specDoc: any;
  selectedTechStack?: any;
  selectedDesign?: any;
}): Promise<void> {
  const fullHtml = await generateDocumentHtml(data);
  const iframe = document.createElement('iframe');
  iframe.style.cssText =
    'position:fixed;right:0;bottom:0;width:0;height:0;border:0;opacity:0;pointer-events:none;z-index:-9999;';
  document.body.appendChild(iframe);

  const doc = iframe.contentWindow?.document;
  if (doc) {
    doc.open();
    doc.write(fullHtml);
    doc.close();

    // Allow resources & fonts to stabilize
    setTimeout(() => {
      try {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
      } catch (err) {
        console.error('Failed to print iframe:', err);
      } finally {
        setTimeout(() => {
          if (document.body.contains(iframe)) {
            document.body.removeChild(iframe);
          }
        }, 60000);
      }
    }, 400);
  }
}

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

export function triggerPrint(): void {
  window.print();
}
