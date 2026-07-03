# 📖 Query Triage Microservice User Manual

Welcome to the comprehensive user manual for the **Query Triage Microservice** (`@csfaq/query-triage`). This microservice serves as the **Human-First Query Resolution and Routing Engine** for the Samagama / CSFAQ platform. It combines automated risk assessment, AI-assisted draft generation (RAG), clustering/deduplication, SLA management, and unified human resolver workflows into a robust, auditable system.

---

## 📋 Table of Contents
1. [Architecture & Core Concepts](#1-architecture--core-concepts)
2. [Prerequisites & Environment Setup](#2-prerequisites--environment-setup)
3. [Running & Testing the Microservice](#3-running--testing-the-microservice)
4. [User API Endpoints](#4-user-api-endpoints)
5. [Admin & Resolver API Endpoints](#5-admin--resolver-api-endpoints)
6. [Real-Time WebSocket Integration](#6-real-time-websocket-integration)
7. [End-to-End Query Lifecycle Workflows](#7-end-to-end-query-lifecycle-workflows)
8. [Database Seeding & Utilities](#8-database-seeding--utilities)
9. [Troubleshooting & Maintenance](#9-troubleshooting--maintenance)

---

## 1. 🏛 Architecture & Core Concepts

The system is built around a **Human-First Triage Engine** that routes incoming user queries through multi-layered evaluations:

```
[ Incoming User Query ]
          │
          ▼
┌────────────────────────────────────────────────────────┐
│ 1. Hard Human Gates Evaluation                         │
│    (Safety Emergency, Private Data, Policy Appeal,     │
│     User Requested Human, Near Deadline ≤24h)          │
└──────────────────────────┬─────────────────────────────┘
                           │
             Triggered?    ├────────── Yes ──────────┐
                           │ No                      ▼
                           ▼            ┌─────────────────────────┐
┌─────────────────────────────────────┐ │  Route to Human Queue   │
│ 2. Intent & Risk Classification     │ │  Status: AWAITING_HUMAN │
│    (Problem, Request, Emergency...) │ └────────────┬────────────┘
└──────────────────┬──────────────────┘              │
                   ▼                                 │
┌─────────────────────────────────────┐              │
│ 3. RAG Knowledge Retrieval          │              │
│    Check AI & Commonality Confidence│              │
└──────────────────┬──────────────────┘              │
                   │                                 │
   ┌───────────────┼───────────────┐                 │
   ▼               ▼               ▼                 │
[Confidence ≥85%] [Conf. 60-84%]  [Confidence <60%]  │
   │               │               │                 │
   ▼               ▼               ▼                 │
Auto-Verify     Route with Draft  Route to Human     │
& Answer        to Human Review   (No Draft)         │
   │               │               │                 │
   ▼               └───────┬───────┘                 │
[Status: ANSWERED]         ▼                         ▼
                    [ Admin / Resolver Claims Case ]
                                   │
                                   ▼
                    [ Resolver Answers & Resolves ]
```

### Key Pillars
- **Hard Human Gates**: Queries matching specific criteria (mental health keywords, attendance/fee discrepancies, explicit requests for human assistance, or deadlines within 24 hours) bypass automated resolution entirely and route straight to human resolvers with escalated priority.
- **Dynamic Priority Calculation (P0 – P3)**:
  - **P0 (Critical)**: Safety emergencies or system-wide outages (15m response SLA, 2h resolution SLA).
  - **P1 (High)**: Escalated issues or major blockers (1h response SLA, 4h resolution SLA).
  - **P2 (Medium)**: Human-requested queries or near-deadline queries (8h response SLA, 48h resolution SLA).
  - **P3 (Routine)**: Standard informational queries (48h response SLA, 120h resolution SLA).
- **Intelligent Deduplication & Clustering**: Similar queries from the same program are clustered under a parent incident to enable bulk broadcasting when resolved.
- **Complete Audit Trail**: Every status transition, assignment change, and AI verification step is recorded in the `QueryAuditEvent` collection.

---

## 2. ⚙ Prerequisites & Environment Setup

### Prerequisites
- **Node.js**: v18+ or v22+ (Native ES Modules support required).
- **MongoDB**: MongoDB 5.0+ (Local instance or MongoDB Atlas cluster).
- **OpenAI API Key** *(Optional)*: Required only if RAG generative answer drafting is enabled.

### Environment Configuration (`.env`)
Create a `.env` file in the root directory (`D:\Phase 1 from G-group\csfaq\apps\query-triage\.env`) with the following settings:

```env
NODE_ENV=development
PORT=5001

# MongoDB Connection String
MONGO_URI=mongodb://localhost:27017/query_triage

# Authentication Secrets (Should match your main auth gateway)
JWT_SECRET=your_jwt_secret_here
JWT_REFRESH_SECRET=your_jwt_refresh_secret_here

# Client CORS Origin
CLIENT_URL=http://localhost:3000

# Logging & Upload Limits
LOG_LEVEL=info
UPLOAD_LIMIT=50mb

# AI & RAG Configuration
OPENAI_API_KEY=sk-...

# Resolver Capacity Thresholds
CAPACITY_WARNING_THRESHOLD=0.70
CAPACITY_CRITICAL_THRESHOLD=0.90
MAX_ACTIVE_CASES_PER_RESOLVER=10

# SLA Configuration (Response / Resolution targets)
SLA_P0_RESPONSE_MINUTES=15
SLA_P0_RESOLUTION_HOURS=2
SLA_P1_RESPONSE_HOURS=1
SLA_P1_RESOLUTION_HOURS=4
SLA_P2_RESPONSE_HOURS=8
SLA_P2_RESOLUTION_HOURS=48
SLA_P3_RESPONSE_HOURS=48
SLA_P3_RESOLUTION_HOURS=120

# AI & Deduplication Thresholds
DUPLICATE_SIMILARITY_THRESHOLD=0.90
MIN_AI_CONFIDENCE=0.85
MEDIUM_AI_CONFIDENCE=0.60
```

---

## 3. 🚀 Running & Testing the Microservice

All commands should be executed inside `D:\Phase 1 from G-group\csfaq\apps\query-triage`.

### 📦 Install Dependencies
```bash
npm install
```

### 💻 Development Mode (Auto-reload with Nodemon)
```bash
npm run dev
```

### 🏁 Production Startup
```bash
npm start
```
When running, the service outputs:
```text
Query Triage running in development mode on port 5001
Swagger Docs available at http://localhost:5001/api-docs
```

### 🧪 Running Automated Unit & Integration Tests
The microservice includes comprehensive test suites powered by Jest in native ESM mode (`--experimental-vm-modules`):
```bash
npm test
```

---

## 4. 👤 User API Endpoints

Base URL: `http://localhost:5001/api/v1`  
Authentication: Requires a valid `Bearer <JWT_TOKEN>` header.

### 1. Submit a New Query
*Submits a query for immediate asynchronous triage processing.*

- **Endpoint**: `POST /queries`
- **Headers**: `Authorization: Bearer <token>`, `Content-Type: application/json`
- **Request Body**:
  ```json
  {
    "programId": "prog_cs_2026",
    "channel": "unified_intake",
    "title": "Cannot access grading interface for Assignment 2",
    "body": "When I click on submission, it gives me a 403 Forbidden error.",
    "humanRequested": false,
    "affectedUsers": "one",
    "deadlineAt": "2026-07-04T18:00:00.000Z"
  }
  ```
- **Response**: `202 Accepted`
  ```json
  {
    "success": true,
    "statusCode": 202,
    "message": "Query submitted successfully and is being processed",
    "data": {
      "queryId": "66850a12e847c2100a9d1234",
      "status": "received",
      "decision": "human_required",
      "priority": "P3",
      "canRequestHuman": true
    }
  }
  ```

### 2. Get My Queries
*Retrieves all queries submitted by the authenticated user.*

- **Endpoint**: `GET /queries/my-queries?status=awaiting_human&limit=20&skip=0`
- **Response**: `200 OK`
  ```json
  {
    "success": true,
    "statusCode": 200,
    "message": "Queries retrieved successfully",
    "data": [
      {
        "_id": "66850a12e847c2100a9d1234",
        "title": "Cannot access grading interface for Assignment 2",
        "status": "awaiting_human",
        "priority": "P2",
        "slaDueAt": "2026-07-05T10:00:00.000Z",
        "createdAt": "2026-07-03T10:15:00.000Z"
      }
    ]
  }
  ```

### 3. Get Specific Query Details
- **Endpoint**: `GET /queries/:id`

### 4. Request Human Intervention
*Escalates an AI-handled or triaging query to human resolvers.*

- **Endpoint**: `POST /queries/:id/request-human`
- **Request Body**:
  ```json
  {
    "reason": "The AI response did not resolve my grading error issue."
  }
  ```

### 5. Close a Resolved Query with Feedback
- **Endpoint**: `POST /queries/:id/close`
- **Request Body**:
  ```json
  {
    "satisfied": true,
    "comment": "Thank you, the resolver fixed my permissions promptly!"
  }
  ```

---

## 5. 🛡 Admin & Resolver API Endpoints

Base URL: `http://localhost:5001/api/v1/admin/queries`  
Authentication: Requires `Bearer <JWT_TOKEN>` with role `Admin`, `Super Admin`, or `Resolver`.

### 1. Unified Triage Inbox
*Fetches prioritized queries ordered by queue score (P0 first, SLA deadlines).*

- **Endpoint**: `GET /inbox?priority=P1&status[]=awaiting_human&limit=50`
- **Response**: `200 OK`
  ```json
  {
    "success": true,
    "statusCode": 200,
    "data": {
      "queries": [
        {
          "_id": "66850a12e847c2100a9d1234",
          "title": "Attendance discrepancy in database class",
          "priority": "P1",
          "queueScore": 84.5,
          "slaStatus": { "status": "warning", "text": "Due in 2h 15m" }
        }
      ],
      "total": 1,
      "capacity": { "status": "normal", "activeCases": 3, "maxCases": 50 }
    }
  }
  ```

### 2. Claim a Case
*Assigns the query case to the calling resolver (enforces maximum active WIP limits).*

- **Endpoint**: `POST /:id/claim`

### 3. Unclaim a Case
*Returns an assigned case back to the `AWAITING_HUMAN` queue.*

- **Endpoint**: `POST /:id/unclaim`

### 4. Answer a Query
*Submits the final resolution answer or sends a response waiting for user confirmation.*

- **Endpoint**: `POST /:id/answer`
- **Request Body**:
  ```json
  {
    "answerText": "We have refreshed your portal permissions. You should now be able to submit Assignment 2.",
    "resolveImmediately": true,
    "nominateForKnowledge": true
  }
  ```

### 5. Get Incident Cluster Details
*Retrieves parent incident details and all linked duplicate query cases.*

- **Endpoint**: `GET /:id/incident`

### 6. View Complete Audit Trail
*Returns every historical event logged for the query case.*

- **Endpoint**: `GET /:id/audit`

### 7. Capacity & Workload Monitoring
- **Endpoint**: `GET /capacity` – Get system-wide active vs. threshold capacity.
- **Endpoint**: `GET /workload` – Get per-resolver active case distribution.

---

## 6. 🔌 Real-Time WebSocket Integration

The microservice runs an integrated **Socket.IO** server alongside Express on the same HTTP port (`5001`).

### Client Connection Example
```javascript
import { io } from 'socket.io-client';

const socket = io('http://localhost:5001', {
  withCredentials: true,
});

socket.on('connect', () => {
  console.log('Connected to Query Triage socket:', socket.id);
  
  // Join user room to receive personal updates
  socket.emit('join:user', 'USER_ID_HERE');
  
  // Or join program room if listening as a course coordinator / admin
  socket.emit('join:program', 'prog_cs_2026');
});

// Listen for status updates on submitted queries
socket.on('query:updated', (data) => {
  console.log('Query Triage Updated:', data);
});

// Listen for assignment notifications
socket.on('query:assigned', (data) => {
  console.log('Your query was claimed by:', data.assignedTo);
});
```

### WebSocket Events Table
| Event Name | Recipient Room | Payload Description |
| :--- | :--- | :--- |
| `query:updated` | `user:<userId>` | Emitted when asynchronous triage finishes classifying and scoring the query. |
| `query:assigned` | `user:<userId>` | Emitted when a resolver claims the user's query case. |
| `query:resolved` | `user:<userId>` | Emitted when a resolver posts the final answer. |
| `query:new_human_case`| `program:<programId>`| Emitted to program admins when a query enters the `AWAITING_HUMAN` queue. |
| `query:human_requested`| `program:<programId>`| Emitted when a user explicitly clicks "Request Human Assistance". |

---

## 7. 🔄 End-to-End Query Lifecycle Workflows

### Scenario A: Routine Knowledge Query (AI Automated Resolution)
1. **User Submits Query**: User asks *"What date does semester registration end?"* via `POST /api/v1/queries`. Service returns `202 Accepted`.
2. **Hard Gate Check**: No emergency or private data keywords detected.
3. **RAG Retrieval**: Service queries the vector store (`RAGService`). Knowledge confidence returns `0.92` (≥ `MIN_AI_CONFIDENCE`).
4. **Auto-Resolution**: The query is transitioned directly to `ANSWERED`. An answer is drafted and stored in `finalAnswer`.
5. **Notification**: The user receives a WebSocket event (`query:updated`) with the AI-verified answer.

### Scenario B: Sensitive / Escalated Query (Human Resolver Workflow)
1. **User Submits Query**: User asks *"Why is my database lab attendance marked absent for June 28?"*.
2. **Hard Gate Triggered**: The keyword `attendance` matches the `PRIVILEGED_DATA` hard human gate rule.
3. **Immediate Routing**: The query bypasses AI answering, receives priority `P1` or `P2`, and enters status `AWAITING_HUMAN`.
4. **Admin Claiming**: A resolver queries `GET /api/v1/admin/queries/inbox`, sees the query, and claims it via `POST /api/v1/admin/queries/:id/claim`. Status changes to `ASSIGNED`.
5. **Resolution**: The resolver investigates the student's attendance record, corrects it, and sends the response via `POST /api/v1/admin/queries/:id/answer`. Status transitions to `RESOLVED`.
6. **Case Closure**: The student reviews the response and submits positive feedback via `POST /api/v1/queries/:id/close`. Status becomes `CLOSED`.

---

## 8. 🌱 Database Seeding & Utilities

To quickly populate the local database with an initial administrator account for testing resolver workflows:

```bash
npm run seed-admin
```

Or execute directly with Node:
```bash
node src/scripts/seedTriageAdmin.js
```

---

## 9. 🛠 Troubleshooting & Maintenance

### Common Issues

1. **MongoDB Connection Refused (`MongooseServerSelectionError`)**
   - **Cause**: MongoDB is not running locally or the connection URI in `.env` is invalid.
   - **Fix**: Ensure your local mongod service is running (`net start MongoDB` on Windows) or verify the `MONGO_URI` connection string.

2. **Resolver Cannot Claim Case (`Maximum active cases reached`)**
   - **Cause**: The resolver currently has more active (`ASSIGNED`) cases than `MAX_ACTIVE_CASES_PER_RESOLVER` (default: `10`).
   - **Fix**: Either complete existing assigned cases via the `/answer` endpoint, or unclaim pending cases via `/unclaim`.

3. **Missing Authorization Header (`401 Unauthorized`)**
   - **Cause**: The request was made without a valid JWT token.
   - **Fix**: Include the HTTP header: `Authorization: Bearer <your_jwt_token>`. Ensure the token has not expired and is signed with `JWT_SECRET`.
