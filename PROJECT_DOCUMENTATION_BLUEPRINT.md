# CSFAQ (AI Knowledge Platform & FAQ Crowdsourcing Hub) — Complete Project Architecture & Documentation Blueprint

## 1. Executive Summary & System Overview

**CSFAQ (Yaksha AI Knowledge Platform)** is a state-of-the-art, tri-tier web application designed for crowdsourced knowledge management, AI-assisted conversational search, and interactive question resolution. It bridges human-curated FAQs with cutting-edge Retrieval-Augmented Generation (RAG), allowing users to explore structured knowledge categories, query an intelligent AI assistant (**Yaksha**), submit unresolved questions for community/admin resolution, and earn gamified rewards (**Spurti Points** via Samagama integration).

---

## 2. High-Level System Architecture

The project is structured as a monorepo consisting of three specialized tiers:

```mermaid
graph TD
    Client["Frontend Client (React 19 + TypeScript + Vite)"]
    Gateway["Backend Core & API Gateway (Node.js + Express 5 + Socket.IO)"]
    AIEngine["AI & Vector Engine (Python + FastAPI + FAISS + Gemini)"]
    MongoDB[(MongoDB Cloud / Local)]
    Redis[(Redis Queue / Cache)]
    Samagama["External Samagama Gamification API"]

    Client <-->|REST API / HTTP| Gateway
    Client <-->|WebSockets (Socket.IO)| Gateway
    Gateway <-->|MongoDB Driver / Mongoose| MongoDB
    Gateway <-->|BullMQ / ioredis| Redis
    Gateway <-->|REST Proxy / Stream| AIEngine
    Gateway <-->|OAuth / Profile Sync| Samagama
```

### Tier 1: Frontend Client (`/client`)
* **Framework:** React 19 with TypeScript, built with Vite.
* **Styling & UI:** TailwindCSS, Lucide Icons, Framer Motion for animations, and `clsx` / `tailwind-merge` for dynamic classes.
* **State Management & Data Fetching:** Redux Toolkit (with `redux-persist` for local caching) and TanStack React Query for server state synchronization.
* **Forms & Validation:** React Hook Form powered by Zod schemas.
* **Real-Time Communication:** `socket.io-client` integrated into a custom `SocketProvider` and conversational hooks (`useChat`).
* **Content Rendering:** `react-markdown` with syntax highlighting (`rehype-highlight` and `remark-gfm`).

### Tier 2: Core API Gateway & Business Logic (`/server`)
* **Framework:** Node.js running Express 5 with ES Modules (`type: "module"`).
* **Database:** MongoDB mapped via Mongoose schemas.
* **Security & Sanitization:** Helmet, CORS, Express Rate Limiting, Mongo Sanitize, and custom XSS cleaning.
* **Validation & Error Handling:** Joi for environment variables, Express-Validator for HTTP request bodies/params, and centralized async error handling (`asyncHandler`, `ApiError`, `ApiResponse`).
* **Logging:** Enterprise-grade logging via Winston Daily Rotate File, generating separate log streams (`application`, `error`, `access`, `security`).
* **Real-Time & Background Jobs:** Socket.IO Server attached to `http.createServer`, alongside BullMQ/Redis integration for asynchronous tasks.

### Tier 3: Python AI & Vector Microservice (`/ai-engine`)
* **Framework:** Python FastAPI server powered by Uvicorn.
* **Vector Database:** FAISS (`faiss-cpu`) storing flat L2 embeddings (`faiss_index.bin`) and chunk metadata (`chunks.json`).
* **Embeddings:** HuggingFace `sentence-transformers` utilizing the `all-MiniLM-L6-v2` model (384-dimensional embeddings).
* **LLM Engine:** Google Gemini API (`gemini-2.5-flash`) via `google-generativeai` with custom generation configuration and system instructions.
* **Ingestion Pipeline:** Custom document processing (`ingest.py`) extracting text from PDF knowledge bases (`docs/KB.pdf`) using `pypdf`, chunking text with sliding window overlap, and indexing them into FAISS.

---

## 3. Core Feature & Module Breakdown

### A. RAG & Knowledge Engine (`/server/src/modules/knowledge-engine` & `/ai-engine`)
* **Hybrid Search Strategy:** Combines MongoDB text indexing (`$text` search on FAQ questions, answers, and keywords) with semantic vector retrieval via the Python FAISS microservice.
* **Document Ingestion:** Automated chunking of knowledge documents, metadata extraction, and embedding generation.
* **FAQ Management:** Supports difficulty levels (Beginner, Intermediate, Advanced), estimated reading times, approval workflows (Draft, Approved, Archived), popularity scoring, and public/private visibility.
* **Interactive Feedback:** Users can vote FAQs as helpful/unhelpful, bookmark answers, and explore related FAQs via knowledge graph relationships (`KnowledgeRelationship`).

### B. Yaksha AI Assistant & Live Streaming (`/server/src/modules/ai`)
* **Multi-Turn Memory:** Manages conversation sessions (`ConversationManager`) by retaining recent turns to provide contextual continuity while pruning older history to optimize token counts.
* **Prompt Sanitization & Security:** Defends against prompt injection and malicious payloads via `PromptSanitizer`.
* **Streaming Architecture:** Supports both HTTP Server-Sent Events (SSE) and WebSocket real-time token streaming. The Express backend proxies live chunked responses from FastAPI directly to the React client via custom Socket.IO events (`chat_metadata`, `chat_chunk`, `chat_done`, `chat_error`).
* **Confidence Telemetry:** Evaluates retrieval relevance and calculates an AI confidence score and rating (High/Medium/Low) for every generation, logging token usage and latency into `AIAnalytics`.

### C. Samagama Gamification & Spurti Points (`/server/src/modules/samagama`)
* **External Integration:** Authenticates users against the external Samagama API to retrieve and sync rewards points (**Spurti Points**).
* **Deterministic Simulation Fallback:** If external Samagama credentials are not configured in `.env`, the system executes a deterministic hash algorithm on the user's email to simulate a stable point balance between 100 and 1000 points.
* **Redemption Store:** Users can spend Spurti Points to unlock exclusive rewards, generating unique, trackable redemption codes (`Redemption` model).

### D. Crowdsourced Query Management (`/server/src/modules/queries`)
* **Unanswered Query Submission:** When users cannot find answers in existing FAQs or via Yaksha AI, they can submit formal queries with priority tagging (Low, Medium, High).
* **Community & Admin Resolution:** Admins and moderators review pending queries, draft verified responses, and transition statuses from `Pending` to `Resolved` or `Dismissed`.

### E. Admin Portal & Telemetry (`/server/src/modules/admin` & `/dashboard`)
* **Role-Based Access Control (RBAC):** Strict middleware checks (`requireAdmin`) protecting sensitive routes.
* **Comprehensive Audit Logging:** Automatically logs user authentication, administrative overrides, and system mutations in MongoDB (`AuditLog` schema) with IP tracking.
* **Dashboard Telemetry:** Real-time metrics tracking active AI conversations, total tokens consumed, saved bookmarks, and historical activity timelines.

---

## 4. Database Schema Specifications (MongoDB)

| Model Name | Key Fields & Types | Purpose & Indexes |
| :--- | :--- | :--- |
| **`User`** | `name` (String), `email` (String, Unique), `password` (Hashed), `role` (ObjectId -> Role), `spurtiPoints` (Number) | Core identity, authentication, and reward balance tracking. |
| **`FAQ`** | `question` (String), `answer` (String), `slug` (String, Unique), `category` (ObjectId -> Category), `tags` ([ObjectId]), `helpfulCount` (Number), `approvalStatus` (Enum), `visibility` (Enum) | Main knowledge base entities. Text indexed on question/answer/keywords. |
| **`Category`** | `name` (String), `slug` (String), `parent` (ObjectId -> Category), `description` (String) | Hierarchical taxonomy for organizing FAQs into trees and collections. |
| **`Query`** | `user` (ObjectId -> User), `question` (String), `status` (Pending/Resolved/Dismissed), `priority` (Low/Medium/High), `response` (String) | Crowdsourced questions submitted by users awaiting admin resolution. |
| **`Conversation`** | `user` (ObjectId -> User), `title` (String), `messages` ([{role, content, timestamp}]), `totalTokens` (Number), `status` (active/archived) | AI chat histories between users and Yaksha AI. |
| **`Bookmark`** | `user` (ObjectId -> User), `faq` (ObjectId -> FAQ), `note` (String), `folder` (String) | Saved answers and documentation snippets for quick reference. |
| **`Redemption`** | `user` (ObjectId -> User), `title` (String), `cost` (Number), `code` (String, Unique), `used` (Boolean) | Tracked reward claims purchased using Spurti Points. |
| **`AuditLog`** | `user` (ObjectId), `action` (String), `resource` (String), `ipAddress` (String), `metadata` (Object) | Immutable system security and user activity trails. |

---

## 5. API Gateway Route Registry

### REST API Endpoints (`/server/src/routes/index.js`)
* `/api/v1/auth/*` — User Registration, Login, Token Refresh, Password Reset, Logout.
* `/api/v1/faqs/*` — CRUD operations for FAQs, Category filtering, Helpful/Unhelpful voting.
* `/api/v1/knowledge/*` — RAG indexing, document chunking management, and hybrid search.
* `/api/v1/ai/*` — AI Orchestration, Conversation history, Bookmark management, AI settings.
* `/api/v1/chat/*` — REST and SSE fallback endpoints for chat completions.
* `/api/v1/queries/*` — Submit user questions, view pending queries, admin resolution endpoints.
* `/api/v1/samagama/*` — Sync Spurti Points, view reward balance, redeem discount codes.
* `/api/v1/dashboard/*` — Aggregate user metrics, activity feeds, and collection counts.
* `/api/v1/admin/*` — System administration, user management, RBAC configuration, audit logs.

### Python AI Microservice Endpoints (`/ai-engine/main.py`)
* `GET /` — Microservice Health Check (`{"status": "ok", "message": "AI Engine Running"}`).
* `POST /api/chat/stream` — Accepts `{"prompt": str, "history": list}`. Computes FAISS semantic similarity, injects retrieved chunks into system context, and yields streamed plain-text tokens from Google Gemini.

### WebSocket Namespace & Event Map (`Socket.IO`)
* **Connection Namespace:** `/` (Default) and `/chat`.
* **Client Emit -> Server Receive:** `join_room`, `leave_room`, `send_message`.
* **Server Emit -> Client Receive:**
  * `chat_metadata`: Delivers conversation ID and initial RAG citations before streaming starts.
  * `chat_chunk`: Delivers real-time string token chunks as generated by the AI engine.
  * `chat_done`: Signals completion of generation along with confidence scoring telemetry.
  * `chat_error`: Broadcasts error states if generation or proxying fails.

---

## 6. Guide for Antigravity Documentation Creation

When feeding this blueprint into **Antigravity** to generate comprehensive project documentation, instruct Antigravity to generate documentation across the following four distinct deliverables:

### 1. Developer Onboarding & Local Setup Guide (`DEVELOPER_GUIDE.md`)
* **Prerequisites:** Node.js v18+, Python 3.10+, MongoDB, and Redis.
* **Environment Configuration:** Detail the required variables across `server/.env`, `client/.env`, and `ai-engine/.env` (especially `GEMINI_API_KEY` and `MONGO_URI`).
* **Execution Flow:** 
  1. Initialize Python environment, install `requirements.txt`, place PDF in `ai-engine/docs/KB.pdf`, and run `python ingest.py` to build `faiss_index.bin`.
  2. Start AI microservice with `python main.py` (Port 8000).
  3. Run backend database seeders (`npm run seed:admin` and seeder scripts in `/server`).
  4. Launch Express Gateway (`npm run dev` in `/server` on Port 5000).
  5. Launch Vite React frontend (`npm run dev` in `/client` on Port 3000).

### 2. End-User & Platform Manual (`USER_MANUAL.md`)
* **Navigating Knowledge Collections:** How to browse hierarchical categories, search using keyword/semantic queries, and filter FAQs by difficulty level.
* **Interacting with Yaksha AI:** How to start AI chat sessions, interpret source citations, bookmark insightful answers, and monitor token consumption.
* **Crowdsourcing Questions:** How to submit unanswered queries to the moderator team and track resolution status.
* **Spurti Points & Rewards:** Explaining how Samagama points are earned, synced, and redeemed for reward codes.

### 3. API Reference & OpenAPI Specification (`API_REFERENCE.md`)
* Detail Request/Response payloads, authentication header requirements (`Authorization: Bearer <JWT>`), and HTTP status codes for all Express REST routes and Python microservice routes.
* Document the Socket.IO event lifecycle with payload JSON schemas for live chat integration.

### 4. Architectural & Security Deep-Dive (`ARCHITECTURE.md`)
* Deep-dive into the RAG ingestion lifecycle (PDF -> Paragraph/Character Chunking -> SentenceTransformer Embeddings -> FAISS L2 Indexing).
* Explain the multi-layer security model (Express Rate Limiting, Mongo Sanitize, Prompt Sanitization against LLM injection, and RBAC admin gating).
