# Blueprint.ai 📐

> **Transform raw software ideas into 13-slide production-ready PRDs, technical architectures, and executable specifications in seconds.**

Blueprint.ai is a full-stack, AI-native architectural engine with Bring-Your-Own-Key (BYOK) privacy, warm tactile neumorphic design, interactive Mermaid diagramming, individual section regeneration, and multi-format document exporting.

---

## 🌟 Key Capabilities

* **13-Slide Comprehensive Blueprint**:
  1. System Architecture Topology (Mermaid diagram with interactive zoom, rotation & PNG/SVG download)
  2. Executive Summary & PRD Scope
  3. Relational Data Model & ERD (Mermaid entity-relationship diagram)
  4. Core API Specification (REST / GraphQL / WebSocket contracts)
  5. UI/UX Design System (Tailwind color palette, typography & tokens)
  6. Security & Compliance Architecture (Auth, RBAC, Data Protection)
  7. Infrastructure & Deployment Topology (Cloud, CI/CD, Containerization)
  8. Milestone Roadmap & Phased Execution
  9. Sprint Backlog & Feature Breakdown
  10. Cost Projections & Resource Estimations (Structured Table)
  11. Third-Party Integrations & Service Dependencies (Structured Table)
  12. Testing & Quality Assurance Strategy (Structured Table)
  13. Risk Register & Mitigation Matrix (Structured Table)

* **Interactive Flowchart Canvas**:
  * Inspect system topologies and ERDs separately in a dedicated modal.
  * Zoom (`+` / `-`), rotate (`R`), and reset (`0`).
  * **Export to PNG** (2x retina raster, pure white background for pitch decks & slides) or **Export to SVG** (lossless vector for Figma & web).

* **Multi-Format Export Engine**:
  * **Print / Save as PDF (Recommended)**: Print-ready layouts preserving diagrams, warm terracotta design, and formatted tables. Split into *Full Blueprint*, *PRD*, or *Tech Architecture*.
  * **Word Document (.doc)**: Formatted for Microsoft Word and Google Docs with embedded diagrams.
  * **Markdown (.md)**: Universal GitHub-Flavored Markdown for repository docs.
  * **JSON Bundle**: Machine-readable project state for CI/CD pipelines.

* **Stateless BYOK (Bring Your Own Key)**:
  * Zero server-side persistence. API keys live strictly in browser `sessionStorage`.
  * Built-in 1-click **"Clear Active API Key Now"** button to purge credentials before leaving shared machines.

---

## 🤖 Supported LLM Providers

| Provider | Recommended Models | Description |
| :--- | :--- | :--- |
| **Google Gemini (Recommended #1)** | `gemini-2.5-flash`, `gemini-3.5-flash` | Generous free tier via [Google AI Studio](https://aistudio.google.com/), 1M+ token context window, ultra-fast generation (~3-5s). |
| **OpenRouter** | `openrouter/free`, `openai/gpt-4o`, `anthropic/claude-3.5-sonnet` | 100% free `:free` models ($0 balance required) plus universal access to GPT and Claude. |
| **Anthropic Claude** | `claude-3-7-sonnet-20250219` | Direct API key for architectural rigor and detailed schema design. |
| **xAI** | `grok-beta` | Direct xAI API key support. |
| **NVIDIA NIM** | Llama 3 models | High-speed enterprise inference endpoints. |

---

## 🚀 Quick Start

### Prerequisites
* [Node.js](https://nodejs.org/) (v18 or higher recommended)
* npm (v9 or higher)

### Installation

Clone the repository and install all monorepo dependencies:

```bash
git clone https://github.com/your-username/blueprint-ai.git
cd blueprint-ai
npm install
```

### Running Locally (Development Mode)

Start both client and server concurrently:

```bash
npm run dev
```

* **Client**: [http://localhost:5173](http://localhost:5173)
* **Server**: [http://localhost:3001](http://localhost:3001)

### Building for Production

```bash
npm run build
```

This compiles `@blueprint/shared`, `@blueprint/server`, and runs Vite production build for `@blueprint/client`.

---

## 📁 Repository Structure

```
Blueprint.ai/
├── client/                      # React 19 + Vite + Tailwind CSS Frontend
│   ├── src/
│   │   ├── components/          # SpecViewer, InstructionsModal, ProviderKeyModal, IdeaInput, etc.
│   │   ├── context/             # SessionContext (stateless key & project management)
│   │   ├── lib/                 # API client, export-helpers, mermaid utilities
│   │   ├── index.css            # Tactile Neumorphism, Terracotta tokens, custom scrollbar
│   │   └── App.tsx              # Main application entry
│   └── vite.config.ts
│
├── server/                      # Node.js + Express + TypeScript Backend
│   ├── src/
│   │   ├── pipeline/            # Stage 1 Classifier, Spec Generator, Section Regenerator
│   │   ├── providers/           # Gemini, OpenRouter, Claude, xAI, NVIDIA adapters
│   │   ├── utils/               # Robust JSON parser & stream handlers
│   │   └── index.ts             # Express server entry point
│   └── tsconfig.json
│
├── shared/                      # Shared TypeScript Interfaces & Enums
│   ├── src/
│   │   ├── types.ts             # Specification schema, 13-slide definitions, provider types
│   │   └── index.ts
│   └── tsconfig.json
│
├── package.json                 # Monorepo root workspace configuration
└── README.md
```

---

## 🔒 Security & Privacy (BYOK)

1. **Client-Side Only Storage**: Your API keys are kept in your browser's temporary memory (`sessionStorage`). Closing the tab or browser automatically discards them.
2. **Never Stored in Databases**: The server acts solely as a pass-through proxy to LLM endpoints and never writes your API key to disk, logs, or databases.
3. **Manual Purge**: You can click the **"Clear Active API Key Now"** button in the guide or the trash icon in Provider Settings at any time to wipe the key immediately.

---

## 📄 License

This project is licensed under the MIT License.
