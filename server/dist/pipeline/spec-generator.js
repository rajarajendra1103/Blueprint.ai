"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.synthesizeFallbackSectionContent = synthesizeFallbackSectionContent;
exports.generateFullSpec = generateFullSpec;
const adapters_1 = require("../adapters");
const spec_prompt_1 = require("../prompts/spec.prompt");
const consistency_checker_1 = require("./consistency-checker");
const SECTION_ORDER = [
    'architecture',
    'requirements',
    'algorithms',
    'dataModel',
    'apiEndpoints',
    'folderStructure',
    'businessLogic',
    'deployment',
    'security',
    'costEstimate',
    'integrations',
    'testingStrategy',
    'riskAssumptions',
];
function withTimeout(promise, ms, timeoutMsg) {
    return Promise.race([
        promise,
        new Promise((_, reject) => setTimeout(() => reject(new Error(timeoutMsg)), ms)),
    ]);
}
async function mapConcurrent(items, concurrency, fn) {
    const results = new Array(items.length);
    let nextIndex = 0;
    async function worker() {
        while (nextIndex < items.length) {
            const idx = nextIndex++;
            results[idx] = await fn(items[idx]);
        }
    }
    const workers = Array.from({ length: Math.min(concurrency, items.length) }, () => worker());
    await Promise.all(workers);
    return results;
}
function synthesizeFallbackSectionContent(sectionId, idea, classification) {
    const domain = classification.domain || 'Software Platform';
    const platform = classification.platform || 'Full-Stack Application';
    switch (sectionId) {
        case 'architecture':
            return `### System Topology & Architectural Style\n- **Pattern**: Multi-tier Modern Client-Server with Decoupled Services\n- **Client Layer**: ${classification.suggestedTechStacks?.recommended?.frontend || 'Modern Web UI'}\n- **API & Core Layer**: ${classification.suggestedTechStacks?.recommended?.backend || 'Express API Service'}\n- **Persistence Layer**: ${classification.suggestedTechStacks?.recommended?.database || 'Relational PostgreSQL'}\n- **Edge / CDN**: Global Edge caching for static assets and TLS termination.\n\n### Key Boundaries & Flow\n1. Client initiates TLS-encrypted HTTPS requests to reverse proxy.\n2. Stateless gateway handles authentication tokens, rate-limiting, and validation.\n3. Business logic services execute transactions against persistent storage with read replicas.`;
        case 'requirements':
            return `### Functional Requirements (FR)\n- **FR-01 (MVP)**: User authentication and role-based session lifecycle.\n- **FR-02 (MVP)**: Core domain workflow processing for "${idea.slice(0, 60)}...".\n- **FR-03 (MVP)**: Real-time status notifications and audit history.\n- **FR-04 (Phase 2)**: Automated batch reporting and third-party webhook integrations.\n\n### Non-Functional Requirements (NFR)\n- **Performance**: 95th percentile latency under 300ms for read operations.\n- **Availability**: 99.9% uptime target with automated health checks.\n- **Security**: Strict OWASP Top 10 compliance and field-level encryption for sensitive payloads.`;
        case 'algorithms':
            return `### Named Core Algorithms\n- **Backend: State Machine Transition Verifier (O(1))**\n  - Enforces valid state transitions and detects illegal concurrency conflicts.\n- **Backend: Idempotent Event Dispatcher (O(log N))**\n  - Prevents duplicate event triggers using sliding window deduplication buffers.\n- **Frontend: Optimistic Mutation Reconciler (O(1))**\n  - Immediately renders UI state and rolls back seamlessly on network rejection.`;
        case 'dataModel': {
            const isCollegeApp = /college|campus|student|teacher|attendance|marks|roll/i.test(idea);
            if (isCollegeApp) {
                return `### Entity-Relationship Architecture
\`\`\`mermaid
erDiagram
    College ||--o{ User : "registers"
    College ||--o{ Course : "offers"
    College ||--o{ NoticeOrPost : "publishes"
    College ||--o{ Resource : "stores"
    College ||--o{ Attendance : "records"
    College ||--o{ Mark : "records"
    User ||--o{ Enrollment : "enrolls"
    Course ||--o{ Enrollment : "contains"
    User ||--o{ ChatParticipant : "joins"
    ChatRoom ||--o{ ChatParticipant : "includes"
    User ||--o{ Message : "sends"
    ChatRoom ||--o{ Message : "holds"
    User ||--o{ Attendance : "logs"
    Course ||--o{ Attendance : "tracks"
    User ||--o{ Mark : "scores"
    Course ||--o{ Mark : "evaluates"

    College {
        uuid id PK
        string name
        string domain UK
        datetime created_at
    }

    User {
        uuid id PK
        uuid college_id FK
        string roll_number UK
        string email UK
        string first_name
        string last_name
        string role "student, teacher, admin"
        datetime created_at
    }

    Course {
        uuid id PK
        uuid college_id FK
        uuid teacher_id FK
        string code UK
        string name
        datetime created_at
    }

    Enrollment {
        uuid id PK
        uuid course_id FK
        uuid student_id FK
        datetime enrolled_at
    }

    ChatRoom {
        uuid id PK
        uuid college_id FK
        string type "personal, group, course"
        string name
        datetime created_at
    }

    ChatParticipant {
        uuid id PK
        uuid chat_room_id FK
        uuid user_id FK
        datetime joined_at
    }

    Message {
        uuid id PK
        uuid chat_room_id FK
        uuid sender_id FK
        string content
        string attachment_url
        datetime created_at
    }

    NoticeOrPost {
        uuid id PK
        uuid college_id FK
        uuid author_id FK
        string title
        string content
        boolean is_announcement
        datetime created_at
    }

    Resource {
        uuid id PK
        uuid college_id FK
        uuid course_id FK
        uuid uploaded_by FK
        string title
        string file_url
        datetime created_at
    }

    Attendance {
        uuid id PK
        uuid college_id FK
        uuid course_id FK
        uuid student_id FK
        string roll_number
        date session_date
        string status "present, absent, late"
        datetime created_at
    }

    Mark {
        uuid id PK
        uuid college_id FK
        uuid course_id FK
        uuid student_id FK
        string roll_number
        string assessment_name
        float marks_obtained
        float total_marks
        datetime created_at
    }
\`\`\`

### Comprehensive Schema Dictionary

| Entity | Field | Type | Constraints | Description |
| :--- | :--- | :--- | :--- | :--- |
| **College** | \`id\` | UUID | PRIMARY KEY | Unique tenant identifier for college isolation |
| | \`name\` | VARCHAR(200) | NOT NULL | Institution name |
| | \`domain\` | VARCHAR(100) | UNIQUE, NOT NULL | Authorized email domain for verification |
| **User** | \`id\` | UUID | PRIMARY KEY | Global user identifier |
| | \`college_id\` | UUID | FOREIGN KEY → College(id) | Tenant association for strict closed-room boundary |
| | \`roll_number\` | VARCHAR(50) | INDEXED, NULLABLE | Student roll number for Excel mark/attendance matching |
| | \`email\` | VARCHAR(255) | UNIQUE, NOT NULL | Institutional login email |
| | \`role\` | ENUM | NOT NULL | Access tier: \`student\`, \`teacher\`, \`college_admin\` |
| **Course** | \`id\` | UUID | PRIMARY KEY | Course or subject section |
| | \`college_id\` | UUID | FOREIGN KEY → College(id) | College isolation constraint |
| | \`teacher_id\` | UUID | FOREIGN KEY → User(id) | Assigned faculty instructor |
| | \`code\` | VARCHAR(30) | NOT NULL | Course code (e.g. CS101) |
| **Enrollment** | \`id\` | UUID | PRIMARY KEY | Student-Course mapping |
| | \`course_id\` | UUID | FOREIGN KEY → Course(id) | Enrolled course |
| | \`student_id\` | UUID | FOREIGN KEY → User(id) | Enrolled student |
| **ChatRoom** | \`id\` | UUID | PRIMARY KEY | Channel / 1:1 conversation room |
| | \`college_id\` | UUID | FOREIGN KEY → College(id) | College isolation boundary |
| | \`type\` | ENUM | NOT NULL | Channel mode: \`personal\`, \`group\`, \`course\` |
| | \`name\` | VARCHAR(100) | NULLABLE | Display name for group/course rooms |
| **ChatParticipant** | \`id\` | UUID | PRIMARY KEY | Room membership entry |
| | \`chat_room_id\` | UUID | FOREIGN KEY → ChatRoom(id) | Target chat room |
| | \`user_id\` | UUID | FOREIGN KEY → User(id) | Member identifier |
| **Message** | \`id\` | UUID | PRIMARY KEY | Chat message instance |
| | \`chat_room_id\` | UUID | FOREIGN KEY → ChatRoom(id) | Target room |
| | \`sender_id\` | UUID | FOREIGN KEY → User(id) | Author user |
| | \`content\` | TEXT | NOT NULL | Message payload |
| | \`attachment_url\`| VARCHAR(500) | NULLABLE | Uploaded media or file reference |
| **NoticeOrPost** | \`id\` | UUID | PRIMARY KEY | Dashboard announcement |
| | \`college_id\` | UUID | FOREIGN KEY → College(id) | Tenant scope |
| | \`author_id\` | UUID | FOREIGN KEY → User(id) | Publisher (Admin/Teacher) |
| | \`is_announcement\`| BOOLEAN | DEFAULT FALSE | Pinned priority indicator |
| **Attendance** | \`id\` | UUID | PRIMARY KEY | Session attendance log |
| | \`college_id\` | UUID | FOREIGN KEY → College(id) | Tenant scope |
| | \`course_id\` | UUID | FOREIGN KEY → Course(id) | Target course |
| | \`student_id\` | UUID | FOREIGN KEY → User(id) | Target student |
| | \`roll_number\` | VARCHAR(50) | INDEXED, NOT NULL | Direct roll-number matching key from Excel |
| | \`session_date\` | DATE | NOT NULL | Lecture / date mark |
| | \`status\` | ENUM | NOT NULL | Status: \`present\`, \`absent\`, \`late\`, \`excused\` |
| **Mark** | \`id\` | UUID | PRIMARY KEY | Assessment grading record |
| | \`college_id\` | UUID | FOREIGN KEY → College(id) | Tenant scope |
| | \`course_id\` | UUID | FOREIGN KEY → Course(id) | Target course |
| | \`student_id\` | UUID | FOREIGN KEY → User(id) | Target student |
| | \`roll_number\` | VARCHAR(50) | INDEXED, NOT NULL | Direct roll-number lookup key from Excel |
| | \`assessment_name\`| VARCHAR(100)| NOT NULL | Quiz, Midterm, or Assignment name |
| | \`marks_obtained\`| DECIMAL(5,2)| NOT NULL | Score received |
| | \`total_marks\` | DECIMAL(5,2)| NOT NULL | Maximum potential score |

### High-Frequency Indexing & Query Optimization
- \`CREATE INDEX idx_users_college_roll ON users(college_id, roll_number);\` — Instant O(1) roll number dashboard lookup.
- \`CREATE INDEX idx_attendance_roll_course ON attendance(college_id, roll_number, course_id);\` — Rapid Excel filter reconciliation.
- \`CREATE INDEX idx_marks_roll_course ON marks(college_id, roll_number, course_id);\` — Filtered student score retrieval.
- \`CREATE INDEX idx_messages_room_created ON messages(chat_room_id, created_at DESC);\` — Sub-millisecond cursor pagination in real-time chat.
- \`CREATE INDEX idx_chat_participants_user ON chat_participants(user_id, chat_room_id);\` — Fast user inbox load.`;
            }
            // Generic domain fallback
            return `### Entity-Relationship Architecture
\`\`\`mermaid
erDiagram
    Organization ||--o{ User : "has"
    Organization ||--o{ CoreEntity : "owns"
    User ||--o{ CoreEntity : "creates"
    CoreEntity ||--o{ AuditLog : "tracks"
    User ||--o{ AuditLog : "triggers"

    Organization {
        uuid id PK
        string name
        string slug UK
        datetime created_at
    }

    User {
        uuid id PK
        uuid organization_id FK
        string email UK
        string full_name
        string role "admin, member, viewer"
        datetime created_at
    }

    CoreEntity {
        uuid id PK
        uuid organization_id FK
        uuid user_id FK
        string title
        string status "draft, active, archived"
        json metadata
        datetime created_at
    }

    AuditLog {
        uuid id PK
        uuid entity_id FK
        uuid user_id FK
        string action
        datetime timestamp
    }
\`\`\`

### Comprehensive Schema Dictionary

| Entity | Field | Type | Constraints | Description |
| :--- | :--- | :--- | :--- | :--- |
| **Organization** | \`id\` | UUID | PRIMARY KEY | Multi-tenant root isolation identifier |
| | \`name\` | VARCHAR(150) | NOT NULL | Tenant display title |
| | \`slug\` | VARCHAR(60) | UNIQUE, NOT NULL | URL-safe tenant identifier |
| **User** | \`id\` | UUID | PRIMARY KEY | User identity record |
| | \`organization_id\` | UUID | FOREIGN KEY | Organization tenant link |
| | \`email\` | VARCHAR(255) | UNIQUE, NOT NULL | Authentication principal |
| | \`role\` | ENUM | NOT NULL | RBAC permission level |
| **CoreEntity** | \`id\` | UUID | PRIMARY KEY | Primary business resource |
| | \`organization_id\` | UUID | FOREIGN KEY | Data boundary constraint |
| | \`user_id\` | UUID | FOREIGN KEY | Author / owner reference |
| | \`status\` | ENUM | NOT NULL | Resource lifecycle state |
| **AuditLog** | \`id\` | UUID | PRIMARY KEY | Immutable compliance trail |
| | \`entity_id\` | UUID | FOREIGN KEY | Target resource |
| | \`user_id\` | UUID | FOREIGN KEY | Actor identifier |
| | \`action\` | VARCHAR(100) | NOT NULL | Operation performed |

### High-Frequency Indexing Strategy
- \`CREATE INDEX idx_users_org ON users(organization_id, email);\` — Multi-tenant login lookup.
- \`CREATE INDEX idx_core_entities_org_status ON core_entities(organization_id, status);\` — Filtered dashboard queries.
- \`CREATE INDEX idx_audit_entity_time ON audit_logs(entity_id, timestamp DESC);\` — Real-time event log retrieval.`;
        }
        case 'apiEndpoints':
            return `### Endpoint Contracts\n- **POST /api/v1/entities**\n  - Summary: Create a new resource entity\n  - Request Body: \`{ "title": string, "metadata": object }\`\n  - Response (201): \`{ "id": "uuid", "status": "active" }\`\n\n- **GET /api/v1/entities**\n  - Summary: List user resources with cursor pagination\n  - Response (200): \`{ "items": [...], "nextCursor": string }\`\n\n- **GET /api/v1/entities/:id**\n  - Summary: Fetch resource details by identifier\n  - Response (200): \`{ "id": "uuid", "title": string, ... }\``;
        case 'folderStructure':
            return `\`\`\`text\n${domain.toLowerCase().replace(/[^a-z0-9]/g, '-')}/\n├── client/\n│   ├── src/\n│   │   ├── components/      # Reusable UI primitives\n│   │   ├── hooks/           # Custom stateful reactive hooks\n│   │   ├── lib/             # API client and formatting utils\n│   │   └── pages/           # Route views\n├── server/\n│   ├── src/\n│   │   ├── controllers/     # HTTP endpoint handlers\n│   │   ├── services/        # Core business invariants\n│   │   ├── models/          # ORM / database access layer\n│   │   └── routes/          # Express route definitions\n└── shared/                  # Common TypeScript schemas and contracts\n\`\`\``;
        case 'costEstimate':
            return `### Projected Infrastructure Cost Model
| Service Tier | MVP (0 - 1k MAU) | Growth (10k - 50k MAU) | Scale (100k+ MAU) | Primary Cost Driver |
| :--- | :--- | :--- | :--- | :--- |
| **Compute / API** | $0 - $15/mo (Serverless/Free) | $45 - $120/mo (Container instances) | $350 - $900/mo (Cluster auto-scaling) | CPU & memory concurrency |
| **Database & Cache** | $0 (Shared/Tier 1) | $30 - $70/mo (Managed Postgres) | $200 - $600/mo (Read replicas & Redis) | Storage IOPS & connection pool |
| **Storage & CDN** | $0 - $5/mo (Cloudflare / S3) | $15 - $40/mo | $80 - $250/mo | Egress bandwidth & media assets |
| **Third-Party APIs** | $0 (Free tiers) | $50 - $150/mo | $300 - $1,200/mo | Transaction volume & SMS/Email |
| **Total Estimated** | **~$15 - $25/mo** | **~$140 - $380/mo** | **~$930 - $2,950/mo** | Dynamic user activity |

### Cost Optimization Tactics
- Utilize global Edge caching (Cloudflare) to absorb 85%+ of static and public read queries without hitting application servers.
- Configure automated connection pooling (PgBouncer) to maximize database throughput on right-sized instances.`;
        case 'integrations':
            return `### Core External Integrations Matrix
| Service Category | Recommended Provider | Protocol / Integration Type | Key Functionality |
| :--- | :--- | :--- | :--- |
| **Authentication** | Supabase Auth / Clerk | OAuth2 & OIDC JWT | Session management, passwordless auth, social logins |
| **Payment Gateway** | Stripe / LemonSqueezy | REST API & Webhooks | Subscriptions, checkout sessions, invoice webhooks |
| **Transactional Email** | Resend / SendGrid | HTTPS REST API | Verification emails, password resets, domain alerts |
| **Object Storage** | AWS S3 / Cloudflare R2 | S3-Compatible API | Secure pre-signed asset uploads & media storage |
| **Observability** | Sentry & PostHog | Client & Server SDKs | Error tracking, session replay, user event analytics |

### Webhook Security & Idempotency
- All inbound webhooks verify cryptographic signatures (HMAC-SHA256) before processing.
- Inbound event payloads are deduplicated using unique event IDs stored in Redis with a 24-hour TTL.`;
        case 'testingStrategy':
            return `### Layered Quality Gate Architecture
| Testing Layer | Scope & Target | Framework & Tooling | Target Coverage | Execution Gate |
| :--- | :--- | :--- | :--- | :--- |
| **Unit Testing** | Domain business rules, calculations, invariant helpers | Vitest / Jest | 85%+ statement coverage | Pre-commit hook & PR check |
| **Integration Testing** | API route handlers, database queries, auth middleware | Supertest + Testcontainers | 75%+ endpoint coverage | CI Pipeline on branch merge |
| **End-to-End (E2E)** | Critical user journeys (signup, checkout, core workflow) | Playwright | Key transactional paths | Nightly & Staging deploy gate |
| **Security Scanning** | Dependency vulnerabilities, secret leakage | Trivy / npm audit / GitGuardian | 0 Critical / High CVEs | Blocking CI build step |`;
        case 'riskAssumptions':
            return `### Core Architectural Assumptions
1. **Infrastructure**: Initial deployment will leverage modern managed PaaS/container services before migrating to dedicated multi-region clusters.
2. **Traffic Pattern**: Read-to-write ratio is expected to be ~8:1, allowing aggressive caching strategies.
3. **Data Residency**: No strict sovereign data partitioning required for MVP; standard GDPR/SOC2 compliance guidelines apply.

### Technical Risk Matrix
| Risk Identification | Likelihood | Impact | Severity | Mitigation Strategy |
| :--- | :--- | :--- | :--- | :--- |
| **Third-Party API Outage** | Medium | High | **P1** | Implement circuit breakers, retries with exponential backoff, and fallback offline states. |
| **Database Connection Exhaustion** | Medium | High | **P1** | Deploy managed connection pooling (PgBouncer/Supabase Pooler) and serverless-safe drivers. |
| **Rapid Data Growth / Hot Partitions** | Low | Medium | **P2** | Enforce index constraints, database partitioning by tenant/date, and soft archival policies. |
| **Security Credential Leak** | Low | Critical | **P0** | Enforce environment variable isolation, secret scanners in CI, and automated key rotation. |`;
        default:
            return `### Overview & Strategy for ${spec_prompt_1.SECTION_METADATA[sectionId]?.title || sectionId}\nThis section defines the operational, architectural, and lifecycle requirements tailored to ${domain} (${platform}).\n\n- **Primary Objective**: Ensure robust, compliant, and scalable implementation.\n- **Execution Baseline**: Standard production patterns with full observability and fault isolation.\n\n*Click "Regenerate Section" to expand with customized LLM synthesis.*`;
    }
}
async function generateFullSpec(idea, classification, config, options = { hybrid: true }) {
    const isHybrid = options.hybrid !== false;
    const adapter = (0, adapters_1.getAdapter)(config.provider);
    const sections = {};
    const siblingContext = {};
    // Foundation sections: 3 core pillars (Architecture, Requirements, Data Model)
    const foundationSections = ['architecture', 'requirements', 'dataModel'];
    for (const sectionId of foundationSections) {
        const meta = spec_prompt_1.SECTION_METADATA[sectionId];
        const { prompt, systemPrompt } = (0, spec_prompt_1.buildSectionPrompt)(sectionId, idea, classification, siblingContext);
        let content = '';
        let isCustom = true;
        try {
            content = await withTimeout(adapter.generate(prompt, config.apiKey, config.model, {
                systemPrompt,
                temperature: 0.5,
            }), 65000, `Timed out after 65s`);
        }
        catch (err) {
            console.warn(`[SpecGenerator] Notice on ${sectionId}: ${err.message}. Using domain baseline.`);
            content = `> ⚠️ **Provider Notice**: ${err.message}\n> *Synthesized domain baseline architecture below. You can click "Regenerate Section" at any time to re-run with another model.*\n\n` +
                synthesizeFallbackSectionContent(sectionId, idea, classification);
            isCustom = false;
        }
        sections[sectionId] = {
            id: sectionId,
            title: meta.title,
            description: meta.description,
            content,
            isApproved: true,
            isCustomGenerated: isCustom,
            lastUpdated: new Date().toISOString(),
        };
        siblingContext[sectionId] = content;
    }
    const remainingSections = SECTION_ORDER.filter((s) => !foundationSections.includes(s));
    if (isHybrid) {
        // In hybrid mode, populate remaining sections immediately with domain baselines (instant response, zero wasted tokens)
        for (const sectionId of remainingSections) {
            const meta = spec_prompt_1.SECTION_METADATA[sectionId];
            const baseline = synthesizeFallbackSectionContent(sectionId, idea, classification);
            sections[sectionId] = {
                id: sectionId,
                title: meta.title,
                description: meta.description,
                content: `> 💡 **Ready for Deep AI Synthesis**: This slide contains an initial domain framework. Click **"✨ Generate Section"** or use the top **"⚡ Generate All Remaining"** button to synthesize customized production specs.\n\n${baseline}`,
                isApproved: false,
                isCustomGenerated: false,
                lastUpdated: new Date().toISOString(),
            };
        }
    }
    else {
        // Non-hybrid mode: Generate all remaining sections concurrently
        await mapConcurrent(remainingSections, 2, async (sectionId) => {
            const meta = spec_prompt_1.SECTION_METADATA[sectionId];
            const { prompt, systemPrompt } = (0, spec_prompt_1.buildSectionPrompt)(sectionId, idea, classification, siblingContext);
            let content = '';
            let isCustom = true;
            try {
                content = await withTimeout(adapter.generate(prompt, config.apiKey, config.model, {
                    systemPrompt,
                    temperature: 0.5,
                }), 65000, `Timed out after 65s`);
            }
            catch (err) {
                console.warn(`[SpecGenerator] Notice on ${sectionId}: ${err.message}. Using domain baseline.`);
                content = `> ⚠️ **Provider Notice**: ${err.message}\n> *Synthesized domain baseline architecture below. You can click "Regenerate Section" at any time to re-run with another model.*\n\n` +
                    synthesizeFallbackSectionContent(sectionId, idea, classification);
                isCustom = false;
            }
            sections[sectionId] = {
                id: sectionId,
                title: meta.title,
                description: meta.description,
                content,
                isApproved: true,
                isCustomGenerated: isCustom,
                lastUpdated: new Date().toISOString(),
            };
        });
    }
    const completeSections = sections;
    let warnings = [];
    try {
        warnings = (0, consistency_checker_1.checkSpecConsistency)(completeSections);
    }
    catch (err) {
        console.warn('Consistency check warning:', err);
    }
    return {
        sections: completeSections,
        warnings,
        isGenerating: false,
    };
}
