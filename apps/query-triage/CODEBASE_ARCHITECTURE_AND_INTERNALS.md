# 🧠 Query Triage Microservice: Deep Technical Architecture & Codebase Internals

This document provides an exhaustive, deep-dive technical analysis of the **Query Triage Microservice** (`@csfaq/query-triage`). It details the exact engineering mechanics, algorithms, data structures, state machines, and workflows implemented across every single module in the codebase.

---

## 📑 Table of Contents
1. [Executive Summary & Architectural Design](#1-executive-summary--architectural-design)
2. [Codebase Map & Module Topology](#2-codebase-map--module-topology)
3. [Deep Dive into Domain Models (`src/models/`)](#3-deep-dive-into-domain-models-srcmodels)
4. [Engine & Core Services Implementation (`src/services/`)](#4-engine--core-services-implementation-srcservices)
   - [4.1 TriageEngine (`TriageEngine.service.js`)](#41-triageengine-triageengineservicejs)
   - [4.2 RAG Knowledge Verification (`RAG.service.js`)](#42-rag-knowledge-verification-ragservicejs)
   - [4.3 Semantic Clustering & Deduplication (`Cluster.service.js`)](#43-semantic-clustering--deduplication-clusterservicejs)
   - [4.4 SLA & Business Hours Calculation (`Sla.service.js`)](#44-sla--business-hours-calculation-slaservicejs)
   - [4.5 Workload & Capacity Protection (`Capacity.service.js`)](#45-workload--capacity-protection-capacityservicejs)
   - [4.6 Query Orchestrator (`Query.service.js`)](#46-query-orchestrator-queryservicejs)
   - [4.7 Immutable Audit Logging (`Audit.service.js`)](#47-immutable-audit-logging-auditservicejs)
5. [API Layer, Controllers & Routes (`src/modules/`)](#5-api-layer-controllers--routes-srcmodules)
6. [Infrastructure, Middlewares & Config (`src/config/`, `src/middlewares/`)](#6-infrastructure-middlewares--config-srcconfig-srcmiddlewares)
7. [Real-Time Event Architecture (`src/config/socket.js`)](#7-real-time-event-architecture-srcconfigsocketjs)
8. [Concurrency, Idempotency & Fault Tolerance](#8-concurrency-idempotency--fault-tolerance)

---

## 1. 🏗 Executive Summary & Architectural Design

The `@csfaq/query-triage` microservice is built as a standalone **ES Module (`type: module`) Express/Node.js application** backed by **MongoDB (Mongoose)** and **Socket.IO**. 

Unlike standard ticketing systems or basic AI chatbots, this microservice enforces a **Human-First Triage Paradigm**:
- AI is treated as a high-speed assistant, but safety, privacy, and privileged university operations strictly require human authority.
- The system prevents resolver burnout by enforcing strict **Work-In-Progress (WIP) capacity limits** and dynamic pull-based routing.
- High query volume is reduced by automatically detecting duplicate questions using vector/cosine similarity and grouping them into **Parent Incident Clusters**.

---

## 2. 🗺 Codebase Map & Module Topology

```
D:\Phase 1 from G-group\csfaq\apps\query-triage\
├── package.json               # ESM configuration, dependencies, and npm scripts
├── server.js                  # Application entry point (HTTP server + Socket.IO initialization)
├── jest.config.js             # ESM test runner configuration
├── .env                       # Environment configuration
└── src\
    ├── app.js                 # Express app setup, CORS, JSON parsing, middleware mounting
    ├── config\
    │   ├── db.js              # Mongoose database connection management with event listeners
    │   ├── env.js             # Environment variable parsing and strict validation via Joi
    │   ├── logger.js          # Winston structured JSON logger with file/console transports
    │   └── socket.js          # Socket.IO room management (user, program, resolver rooms)
    ├── constants\
    │   └── triage.constants.js# Domain enums, risk tags, decision reasons, SLA targets
    ├── middlewares\
    │   ├── auth.middleware.js # JWT validation & RBAC (Role-Based Access Control)
    │   ├── error.middleware.js# Global error interceptor differentiating operational vs syntax errors
    │   └── rateLimiter.middleware.js # In-memory sliding window rate limiter
    ├── models\
    │   ├── QueryCase.model.js # Core aggregate entity schema & state transition methods
    │   ├── QueryAuditEvent.model.js # Immutable audit log schema
    │   └── CapacityStatus.model.js  # Resolver WIP capacity & historical system snapshots
    ├── modules\
    │   ├── admin\             # Controllers & routes for Admin/Resolver operations
    │   └── queries\           # Controllers & routes for End-User query lifecycle
    ├── routes\
    │   ├── health.routes.js   # Kubernetes/Docker liveness probe endpoints
    │   └── index.js           # API router aggregator mounted at /api/v1
    └── services\
        ├── Audit.service.js       # Asynchronous event recording service
        ├── Capacity.service.js    # Workload monitoring and WIP limit enforcement
        ├── Cluster.service.js     # Text normalization, TF calculation & Cosine similarity
        ├── Query.service.js       # Lifecycle orchestrator (submission, claims, answers)
        ├── RAG.service.js         # Retrieval-Augmented Generation & citation verification
        ├── Sla.service.js         # Business-hours SLA due date & breach calculations
        └── TriageEngine.service.js# Core decision tree and hard gate evaluation engine
```

---

## 3. 🔬 Deep Dive into Domain Models (`src/models/`)

### 3.1 `QueryCase` (`src/models/QueryCase.model.js`)
This is the central domain aggregate representing a query or issue submitted by a student or user.

#### Core Schema Fields:
- `idempotencyKey`: Unique string index preventing duplicate submissions caused by network retries or double clicks.
- `userId` & `programId`: Partition keys ensuring strict multi-tenant / multi-program data isolation.
- `channel`: Submission entry point (`unified_intake`, `community`, `support`, `faq_search`, `ask_ai`).
- `classification`: Embedded document populated by the `TriageEngine` containing intent category, detected `riskTags` (`private_data`, `financial`, `privileged_action`), and confidence scores.
- `decision`: Current routing choice (`ai_answer`, `human_required`, `human_review_ai_draft`, `needs_information`).
- `priority`: Escalation level (`P0`, `P1`, `P2`, `P3`).
- `slaDueAt`: Timestamp calculated by `SlaService` indicating the strict SLA response/resolution deadline.
- `status`: Lifecycle state governed by a strict state machine.
- `parentIncidentId` & `isParentIncident`: Clustering fields linking duplicate queries under a single root incident.
- `aiDraft` & `finalAnswer`: Embedded objects capturing AI-proposed text versus the final human/AI verified output.

#### State Machine & Methods:
- `canTransitionTo(nextStatus)`: Enforces legal lifecycle moves:
  ```text
  RECEIVED ➔ TRIAGING ➔ AWAITING_HUMAN ➔ ASSIGNED ➔ RESOLVED ➔ CLOSED
                 │               ▲              │
                 ▼               └──────────────┘ (Unclaim / Re-route)
             ANSWERED ➔ CLOSED
  ```
- `calculatePriority(queryData)` *(Static Method)*: Evaluates reasons and metadata to assign P0–P3 priority. If safety tags or system outages exist, returns `P0`. If deadline is within 24 hours, returns `P1`. If human requested or private data needed, returns `P2`.

### 3.2 `QueryAuditEvent` (`src/models/QueryAuditEvent.model.js`)
An immutable audit log tracking every interaction on a query case for governance and debugging.
- **Fields**: `queryCaseId`, `eventType` (`created`, `triage_started`, `status_changed`, `assigned`, `unassigned`, `answered`, `escalated`, `closed`), `actorType` (`user`, `admin`, `system`, `ai`), `actorId`, `fromStatus`, `toStatus`, and `metadata` (JSON payload).

### 3.3 `ResolverCapacity` & `CapacitySnapshot` (`src/models/CapacityStatus.model.js`)
- `ResolverCapacity`: Tracks individual resolver workload. Stores `activeCases` count, `capacityPercent` ($activeCases / maxCases$), and status (`available`, `busy`, `overloaded`, `offline`).
- `CapacitySnapshot`: Periodic time-series logs recording overall system active cases, active resolvers, average capacity percentage, and number of breached SLA cases.

---

## 4. ⚙ Engine & Core Services Implementation (`src/services/`)

### 4.1 TriageEngine (`src/services/TriageEngine.service.js`)
The `TriageEngine` executes the decision pipeline whenever a query transitions to `TRIAGING`.

#### Step 1: Hard Human Gates (`evaluateHardGates`)
Iterates sequentially through `HARD_HUMAN_GATE_RULES`. If any rule evaluates to `true`, AI generation is aborted immediately, priority is recalculated, and the case routes to `AWAITING_HUMAN`:
1. `USER_REQUESTED_HUMAN`: Checks if `humanRequested === true`.
2. `SAFETY_EMERGENCY`: Regex evaluation against title + body for mental health or physical danger keywords (`/\b(depressed|suicide|self[- ]harm|harassment|abuse|emergency|danger|threat)\b/`).
3. `PRIVILEGED_DATA`: Detects attendance, marks, grade, or fee payment inquiries requiring private database inspection (`/\b(attendance|marks?|grade|fees?|payment|account.*issue|missing.*data|private)\b/`).
4. `POLICY_APPEAL`: Detects requests for policy overrides or fee waivers (`/\b(exception|appeal|waive|reconsider|make.*exception)\b/`).
5. `NEAR_DEADLINE`: Checks if `deadlineAt` exists and falls within the next 24 hours.

#### Step 2: Risk & Intent Classification (`classifyQuery`)
Executes keyword and regex classifiers against the query text, populating `classification.riskTags` and setting boolean flags `requiresPrivateData` or `requiresPrivilegedAction`. Initializes `categories` and sets the dominant intent (`problem`, `information`, `request`, `complaint`, `emergency`).

#### Step 3: RAG Retrieval & Routing Decision
Invokes `RAGService.retrieve(queryText, programId)`. Based on confidence thresholds (`env.thresholds`):
- **High Confidence ($\ge 0.85$) & High Commonality ($\ge 0.70$)**: Invokes `verifyAndGenerate()`. If verified true, sets decision to `AI_ANSWER`, status to `ANSWERED`, and populates `finalAnswer`.
- **Medium Confidence ($0.60 \text{ to } 0.84$)**: Sets decision to `HUMAN_REVIEW_AI_DRAFT`. Stores draft in `aiDraft` (hidden from user) and queues case to `AWAITING_HUMAN` for resolver verification.
- **Low Confidence ($< 0.60$)**: Routes directly to `AWAITING_HUMAN` as `HUMAN_REQUIRED`.

Finally, regardless of routing, calls `ClusterService.findPotentialDuplicate()` to detect and link duplicate cases.

---

### 4.2 RAG Knowledge Verification (`src/services/RAG.service.js`)
Handles knowledge base search and strict hallucination prevention:
- **Program Isolation (`filterByProgramScope`)**: Ensures documents belong exclusively to the query's `programId` and possess an approval status of `published` or `approved`.
- **Relevance Scoring (`scoreResults`)**: Boosts search scores based on exact term matches and popularity.
- **Citation Grounding Check (`verifyCitations`)**: Extracts query terms ($>3$ chars) and verifies that at least 30% of query terms physically exist within the retrieved source texts before permitting an AI answer.
- **Contradiction Detection (`checkContradictions`)**: Checks variance among multiple retrieved answers to flag conflicting policy documents.

---

### 4.3 Semantic Clustering & Deduplication (`src/services/Cluster.service.js`)
Prevents resolver queue floods by identifying duplicate issues:
- **Tokenization (`tokenize`)**: Converts text to lowercase, strips punctuation/special characters, filters out tokens under 3 characters, and removes English stop words (`the`, `is`, `what`, `why`, `how`, etc.).
- **Vectorization & Term Frequency (`calculateTermFrequency`)**: Builds normalized word frequency vectors for texts.
- **Cosine Similarity (`calculateSimilarity`)**: Computes dot product over vector magnitudes:
  $$\text{Similarity}(A, B) = \frac{\sum (A_i \times B_i)}{\sqrt{\sum A_i^2} \times \sqrt{\sum B_i^2}}$$
- **Duplicate Linking (`findPotentialDuplicate`)**: Compares new query against open cases (`AWAITING_HUMAN` or `ASSIGNED`) in the same program within the last 48 hours. If similarity $\ge 0.90$ (or $0.85$ under system overload), links the query to the existing case (`parentIncidentId`). If the target case wasn't already a parent, promotes it by setting `isParentIncident = true`.

---

### 4.4 SLA & Business Hours Calculation (`src/services/Sla.service.js`)
Computes response and resolution deadlines:
- **Priority Table**:
  - `P0`: Calendar minutes/hours (24/7 continuous clock). Response: 15m, Resolution: 2h.
  - `P1`: Business hours. Response: 1h, Resolution: 4h.
  - `P2`: Business hours. Response: 8h, Resolution: 48h.
  - `P3`: Business hours. Response: 48h, Resolution: 120h.
- **Business Hours Algorithm (`addBusinessHours`)**: Increments dates hour-by-hour while skipping weekends (`getDay() === 0 || getDay() === 6`) and non-working hours ($<9\text{ AM or }\ge 6\text{ PM}$).
- **Status Formatter (`getSlaStatus`)**: Evaluates remaining time to categorize SLA health as `ok`, `warning` ($<4\text{ hours left}$), `critical` ($<1\text{ hour left}$), or `breached`.

---

### 4.5 Workload & Capacity Protection (`src/services/Capacity.service.js`)
Safeguards resolvers from queue overload:
- **System Health (`getSystemCapacity`)**: Calculates $\text{Capacity \%} = \frac{\text{Total Active Cases}}{\text{Resolvers} \times \text{Max Cases/Resolver}}$. Categorizes system as `NORMAL`, `WATCH` ($\ge 70\%$), `WARNING` ($\ge 90\%$), or `OVERLOAD` ($\ge 100\%$).
- **WIP Enforcement (`canAcceptCases`)**: Queries `ResolverCapacity`. If a resolver already holds $\ge 10$ active cases, prevents them from claiming additional work.
- **Pull-Based Routing (`getAvailableResolvers`)**: Sorts available resolvers ascending by `capacityPercent` so cases are claimed by or assigned to least-loaded personnel first.

---

### 4.6 Query Orchestrator (`src/services/Query.service.js`)
The central transaction coordinator:
- `submitQuery(data, user)`: Validates idempotency, persists `QueryCase` as `RECEIVED`, writes audit logs, and launches non-blocking background triage (`setImmediate(() => this.processTriage(...))`).
- `claimCase(queryId, resolverId, resolverName)`: Validates state transition `canTransitionTo('assigned')`, checks `CapacityService.canAcceptCases()`, assigns `assignedTo = resolverId`, and updates resolver active case metrics.
- `unclaimCase(queryId, resolverId)`: Reverts status back to `AWAITING_HUMAN`, clears `assignedTo`, and decrements resolver WIP load.
- `answerQuery(queryId, { answerText, resolveImmediately }, resolverId)`: Transitions case to `RESOLVED` (or `WAITING_FOR_USER`), saves `finalAnswer`, emits WebSocket notification `query:resolved`, and **Cascade Resolves** any linked child cases if `isParentIncident === true`.

---

## 5. 🔌 API Layer, Controllers & Routes (`src/modules/`)

### End-User Query Module (`src/modules/queries/`)
- `Query.routes.js`: Mounted at `/api/v1/queries`. All routes pass through `authenticate`.
- `Query.controller.js`:
  - `POST /`: Validates input with Joi (`createQuerySchema`), invokes `QueryService.submitQuery()`, returns HTTP `202 Accepted`.
  - `GET /my-queries`: Retrieves paginated queries filtered by authenticated `req.user._id`.
  - `POST /:id/request-human`: Transitions AI-answered or open cases to `AWAITING_HUMAN` with user reason.
  - `POST /:id/close`: Accepts `satisfied` boolean feedback and marks case `CLOSED`.

### Admin & Resolver Module (`src/modules/admin/`)
- `Admin.routes.js`: Mounted at `/api/v1/admin/queries`. Requires roles `Admin`, `Super Admin`, or `Resolver`.
- `Admin.controller.js`:
  - `GET /inbox`: Calls `QueryService.getAdminInbox()`. Sorts open queue dynamically by **Queue Score**:
    $$\text{Queue Score} = \text{Priority Weight} + \text{SLA Breached Weight} + \text{Age in Hours}$$
  - `POST /:id/claim` & `POST /:id/unclaim`: Manages resolver case ownership.
  - `POST /:id/answer`: Submits resolution answer.
  - `GET /capacity` & `GET /workload`: Returns system health dashboards and resolver WIP breakdowns.

---

## 6. 🛡 Infrastructure, Middlewares & Config (`src/config/`, `src/middlewares/`)

- `env.js`: Uses `dotenv` to load `.env` variables and runs strict Joi validation on startup. If environment variables are malformed or missing outside test mode, crashes early (`process.exit(1)`).
- `auth.middleware.js`: Extracts Bearer token, verifies via `jwt.util.js`, attaches decoded user to `req.user`. `requireRole(...roles)` interceptor verifies user roles against allowed list.
- `error.middleware.js`: Differentiates operational `ApiError` instances (returning appropriate HTTP status codes like `400`, `401`, `404`, `409`, `422`) from unexpected internal crashes (`500 Internal Server Error`).
- `rateLimiter.middleware.js`: Memory-backed rate limiter preventing DoS attacks on submission endpoints.

---

## 7. 📡 Real-Time Event Architecture (`src/config/socket.js`)

The HTTP server shares its instance with Socket.IO.
- **Rooms**: Clients join specific rooms upon connection:
  - `user:<userId>`: Joined by individual end-users to receive status notifications (`query:updated`, `query:assigned`, `query:resolved`).
  - `program:<programId>`: Joined by department coordinators to monitor intake queues (`query:new_human_case`).
  - `resolver:<resolverId>`: Joined by admin resolvers for direct workload updates.

---

## 8. 🔒 Concurrency, Idempotency & Fault Tolerance

1. **Idempotency Guarantee**: Every query submission accepts or generates an `idempotencyKey`. A MongoDB unique index guarantees that double submissions within network retries return the existing record (`isIdempotent: true`) without creating duplicate tickets.
2. **Non-Blocking Asynchronous Triage**: Heavy operations (RAG vector searches, keyword regex loops, cluster cosine comparisons) run inside `setImmediate()`, ensuring the Express HTTP request thread responds instantly with `202 Accepted`.
3. **Resilient Test Configuration**: During `NODE_ENV=test`, missing external environment files automatically fallback to memory defaults, enabling seamless CI/CD test execution.
