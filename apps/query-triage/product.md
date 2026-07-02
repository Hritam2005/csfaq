# Product Specification: Human-First Query Resolution Service (Query Router)

**Document Status:** Production-Ready Specification  
**Product Name:** Query Router / Samagama Query Triage Microservice  
**Target Deployment:** `apps/query-triage` (Standalone Microservice / Bounded Module)  
**Primary Objective:** Deliver a human-first, AI-assisted query resolution gateway that protects scarce human attention (2–3 resolvers for 1,000+ students) while guaranteeing human accountability, empathy, and privileged action for every consequence-critical question.

---

## 1. Executive Summary & Product Philosophy

### 1.1 One-Line Product Statement
Build a unified, human-first query gateway that answers only repetitive, low-risk questions from verified, program-scoped knowledge and routes novel, personal, sensitive, urgent, or explicitly human-requested queries to accountable administrators with automated context clustering and SLA enforcement.

### 1.2 Core Product Promise
> **"AI handles repetition. Humans handle consequence."**

### 1.3 The Core Problem
In educational and community ecosystems like Samagama (Yaksha FAQ Portal), users often face two broken extremes:
1. **Frustrating Deflection:** Users are trapped in endless AI chatbot loops when they genuinely need human judgment, policy exceptions, privileged account actions, or empathetic support.
2. **Operational Overload:** A small human administration team (2–3 staff members serving 1,000+ active students) is bogged down answering repetitive, routine questions that already have documented answers, leaving little time to handle high-consequence emergencies or complex student appeals.

Furthermore, existing systems suffer from **fragmented queues**—where FAQs, Community Q&A, AI Auto-Answers, and Support Tickets operate in siloed state machines with inconsistent program scoping, unapproved knowledge ingestion, and lack of canonical user urgency modeling.

### 1.4 The Strategic Solution
The **Query Router** unifies intake across all query channels into a single orchestration engine governed by strict safety rules:
- **Zero False Automation:** Hard safety gates override AI confidence scores. If a query touches private data, sensitive topics, or if a user explicitly requests a human, AI is forbidden from sending an automated response.
- **Incident & Duplicate Clustering:** Equivalent queries are dynamically linked into parent incidents so a single staff answer resolves dozens of duplicate student tickets simultaneously.
- **Verified RAG Provenance:** Automated answers are generated *exclusively* from approved, active, program-scoped knowledge sources with strict citation checks.

---

## 2. Comprehensive System Flowcharts

### 2.1 End-to-End Query Triage & Decision Flowchart

The following flowchart illustrates the complete journey of a query submitted to the platform, highlighting the hard human gates, RAG verification pipeline, and resolution lifecycles.

```mermaid
flowchart TD
    %% Intake Node
    Sub["User Submits Query via Unified Intake / Community / Support"] --> Val["Intake Validation & JWT Auth Verification"]
    Val --> Redact["PII / Secret Redaction Engine"]
    
    %% Hard Human Gate
    Redact --> HardGate{"Hard Human Rule Triggered?<br/>(User Requested Human, PII Needed,<br/>Policy Appeal, Safety/Legal Risk,<br/>System Outage, Near Deadline)"}
    
    HardGate -->|Yes| HQ["Create Human-Required Case<br/>(Status: awaiting_human)"]
    HardGate -->|No| RAG["Retrieve Approved Program-Scoped Knowledge<br/>(Vector + BM25 Hybrid Search)"]
    
    %% Retrieval Evaluation
    RAG --> Score{"Retrieval Confidence >= 0.85<br/>& High Commonality Score?"}
    
    Score -->|Yes| Gen["Generate Grounded Answer via LLM<br/>(Strict Program Constraints)"]
    Score -->|No| DraftCheck{"Medium Confidence (0.60 - 0.84)<br/>or Draft Available?"}
    
    %% Verification Gate
    Gen --> Verify{"Citation & Policy Gate Verification:<br/>1. Claims Traceable to Citations?<br/>2. Sources Approved & Active?<br/>3. Zero Source Contradictions?"}
    
    Verify -->|Passed| AIAns["Publish Labelled AI Answer<br/>'AI answer from verified knowledge'"]
    Verify -->|Failed| DraftCheck
    
    DraftCheck -->|Yes| DraftQ["Create Human Case with Private AI Draft<br/>(Status: awaiting_human)"]
    DraftCheck -->|No| HQ
    
    %% AI Post-Answer Resolution
    AIAns --> UserCheck{"User Satisfied?<br/>(Did this solve your problem?)"}
    UserCheck -->|Yes| AutoClose["Close Case<br/>(Status: closed)"]
    UserCheck -->|No / Requests Human| HQ
    
    %% Human Queue Processing
    HQ --> Priority["Priority Engine Calculation<br/>(Assign P0/P1/P2/P3 & SLA Due Date)"]
    DraftQ --> Priority
    Priority --> Cluster["Duplicate & Incident Cluster Matcher"]
    Cluster --> Inbox["Unified Admin Operational Inbox"]
    
    Inbox --> AdminAction{"Admin Action"}
    AdminAction -->|Reply / Answer| HumanAns["Send Human Answer to User<br/>(& All Linked Cluster Users)"]
    AdminAction -->|Request Info| NeedInfo["Status: waiting_for_user"]
    NeedInfo --> UserReply["User Supplies Evidence"] --> Inbox
    
    HumanAns --> ResolveCase["Status: resolved"]
    ResolveCase --> PromoCheck{"Candidate for Knowledge Base?<br/>(Generalisable & Approved)"}
    PromoCheck -->|Yes| Promo["Promote to Approved FAQ / KB Article"]
    PromoCheck -->|No| EndCase["Archived Case"]
```

---

### 2.2 Omnichannel Integration Routing Flowchart

How existing legacy channels map into the unified Query Router microservice:

```mermaid
flowchart LR
    subgraph Channels [User Interaction Channels]
        C1["Community Q&A Submission"]
        C2["Session Support Ticket Form"]
        C3["FAQ Search (Zero Results / Unresolved)"]
        C4["Ask AI Interactive Widget"]
    end

    subgraph Router [Query Router Microservice API]
        IntakeAPI["POST /v1/queries (Idempotency Enforced)"]
        Engine["Triage & Classification Engine"]
    end

    subgraph Adapters [Channel Adapters & Storage]
        CommAdapter["Community Post Lifecycle Sync"]
        SuppAdapter["SupportRequest Legacy Sync"]
        SearchAdapter["Search Feedback Logger"]
    end

    C1 --> IntakeAPI
    C2 --> IntakeAPI
    C3 --> IntakeAPI
    C4 --> IntakeAPI

    IntakeAPI --> Engine
    Engine --> CommAdapter
    Engine --> SuppAdapter
    Engine --> SearchAdapter
```

---

## 3. Detailed State Diagrams

### 3.1 QueryCase Lifecycle State Machine

Every query submitted to the Query Router transitions through a deterministic state machine designed for full auditability.

```mermaid
stateDiagram-v2
    [*] --> received: POST /v1/queries
    
    received --> triaging: Asynchronous Worker Pick
    
    state triaging {
        [*] --> check_hard_rules
        check_hard_rules --> rag_search: Passed Hard Gate
        check_hard_rules --> flag_human: Hard Rule Hit
        rag_search --> verify_generation: Score >= Threshold
        rag_search --> flag_draft: Score Medium
        rag_search --> flag_human: Score Low
        verify_generation --> flag_ai: Verified Valid
        verify_generation --> flag_draft: Verification Failed
    }
    
    triaging --> answered: Decision = ai_answer
    triaging --> awaiting_human: Decision = human_required OR human_review_ai_draft
    
    answered --> closed: User Confirms Resolution (Timeout 7 days)
    answered --> awaiting_human: User Clicks 'I need a human'
    
    awaiting_human --> assigned: Admin Claims / Auto-Assigner
    
    assigned --> waiting_for_user: Admin Requests More Info / Evidence
    waiting_for_user --> assigned: User Follows Up with Details
    
    assigned --> resolved: Admin Provides Official Human Answer
    
    resolved --> closed: User Confirms OR 48h Auto-Close
    resolved --> assigned: User Reopens (Unsatisfied)
    
    closed --> promoted_to_faq: Knowledge Reviewer Authorises Promotion
    closed --> [*]
    promoted_to_faq --> [*]
```

---

### 3.2 SLA Management & Overload Protection State Machine

Protects the 2–3 human resolvers during traffic spikes or outages.

```mermaid
stateDiagram-v2
    [*] --> NormalOps: Workload < 70% Forecast Capacity
    
    NormalOps --> WatchState: Workload >= 70% Capacity
    WatchState --> NormalOps: Workload < 70%
    
    WatchState --> WarningState: Workload >= 90% Capacity
    WarningState --> WatchState: Workload < 90%
    
    WarningState --> OverloadState: Workload >= 100% OR Active Outage
    OverloadState --> WarningState: Backlog Cleared below 90%
    
    state OverloadState {
        [*] --> ProtectP0P1: Lock P0/P1 SLA Targets
        ProtectP0P1 --> DeferP3: Defer P3 SLA Estimates Transparently
        DeferP3 --> AlertAdmins: Trigger PagerDuty/Slack Staffing Escalation
    }
```

---

## 4. Sequence Diagrams (UML)

### 4.1 Sequence Diagram 1: Automated Low-Risk Query Resolution (RAG + Verification)

Shows how a low-risk, routine student question is processed, verified against program-scoped knowledge, and answered automatically without human intervention.

```mermaid
sequenceDiagram
    autonumber
    actor User as Student User
    participant API as Query Router API (`POST /v1/queries`)
    participant Triage as Triage & Policy Engine
    participant KB as Knowledge Service (RAG)
    participant LLM as AI Provider Service
    participant DB as QueryCase MongoDB

    User->>API: Submit Query ("When is Orientation?", programId: "cs-2026")
    activate API
    API->>DB: Check Idempotency Key
    DB-->>API: Key Not Found (New Request)
    API->>DB: Insert Case (status: received)
    API-->>User: 202 Accepted (queryId: "qry_101", status: "triaging")
    deactivate API

    activate Triage
    Triage->>Triage: Execute PII & Secret Redaction
    Triage->>Triage: Evaluate Hard Human Rules (None triggered)
    Triage->>KB: Hybrid Search (query, programId: "cs-2026", approvedOnly: true)
    activate KB
    KB-->>Triage: Return Top Matches (Score: 0.92, Approved FAQ Found)
    deactivate KB

    Triage->>LLM: Generate Answer with Citations & Context
    activate LLM
    LLM-->>Triage: Synthesised Answer + Cited Source IDs
    deactivate LLM

    Triage->>Triage: Verify Citations (Check exact source match & zero contradiction)
    Triage->>DB: Update Case (status: answered, decision: ai_answer, finalAnswer: AI)
    Triage-->>User: WebSocket / Notification: "AI Answer Available"
    deactivate Triage
```

---

### 4.2 Sequence Diagram 2: High-Risk / Human-Required Triage & Assignment

Shows the sequence when a student submits a query requiring human judgment, privileged data access, or explicit human override.

```mermaid
sequenceDiagram
    autonumber
    actor User as Student User
    participant API as Query Router API
    participant Triage as Triage & Policy Engine
    participant DB as QueryCase DB
    participant Inbox as Unified Admin Inbox
    actor Admin as Staff Resolver (1 of 3)

    User->>API: Submit Query ("My attendance sheet is missing marks", humanRequested: true)
    activate API
    API->>DB: Insert Case (status: received)
    API-->>User: 202 Accepted (queryId: "qry_102")
    deactivate API

    activate Triage
    Triage->>Triage: Evaluate Hard Rules (Rule hit: USER_REQUESTED_HUMAN + PRIVILEGED_DATA)
    Triage->>Triage: Calculate Priority (P2: Individual Account Issue, SLA: 8 Business Hours)
    Triage->>DB: Search Existing Cases for Duplicate/Incident Match
    DB-->>Triage: No Match Found (Standalone Case)
    Triage->>DB: Update Case (status: awaiting_human, priority: P2, slaDueAt: "+8h")
    deactivate Triage

    Admin->>Inbox: Poll / Fetch Filtered Queue (sorted by SLA Due & Priority)
    Inbox-->>Admin: Display Case "qry_102" (Badges: [Human Requested] [P2])
    Admin->>Inbox: POST /v1/admin/queries/qry_102/claim
    Inbox->>DB: Atomic Update (status: assigned, assignedTo: "admin_1")
    DB-->>Inbox: 200 OK (Claim Successful)
```

---

### 4.3 Sequence Diagram 3: Duplicate Incident Clustering & Mass Resolution

Demonstrates how the microservice handles 100 students submitting the same system outage query simultaneously, enabling 1 admin action to resolve all 100 tickets.

```mermaid
sequenceDiagram
    autonumber
    actor Users as 100 Affected Students
    participant API as Query Router API
    participant Triage as Cluster Matcher Engine
    participant DB as QueryCase DB
    actor Admin as Staff Resolver

    Note over Users, API: 100 students report: "Assessment portal showing 500 Internal Error"
    Users->>API: POST /v1/queries (Bulk Arrivals within 5 mins)
    API->>Triage: Process Incoming Streams
    activate Triage
    Triage->>Triage: Semantic Embedding & Title Similarity Match (Cosine >= 0.90)
    Triage->>DB: Identify First Case ("qry_leader_1") as Parent Incident
    Triage->>DB: Link 99 Cases to Parent ("qry_leader_1", status: awaiting_human)
    Triage->>DB: Promote Parent Priority to P1 (Affected Users: "many")
    deactivate Triage

    Admin->>DB: View Incident Dashboard
    DB-->>Admin: Show Incident "qry_leader_1" (Linked Cases: 99, Priority: P1)
    Admin->>API: POST /v1/admin/queries/qry_leader_1/answer (Resolution: "Fixed server issue")
    activate API
    API->>DB: Update Parent + All 99 Child Cases (status: resolved)
    API->>Users: Broadcast Resolution Notification to all 100 Students
    deactivate API
```

---

### 4.4 Sequence Diagram 4: Knowledge Promotion Workflow

Illustrates how an official human resolution is sanitised and promoted into the permanent FAQ base to prevent future repeated questions.

```mermaid
sequenceDiagram
    autonumber
    actor Admin as Staff Resolver / Reviewer
    participant API as Admin API (`POST /v1/admin/queries/:id/resolve`)
    participant Promo as Knowledge Promotion Service
    participant Redact as PII Redaction Engine
    participant KB as Knowledge Base Service

    Admin->>API: Resolve Case & Check "Nominate for Knowledge Base"
    activate API
    API->>Promo: Initiate Promotion Review (caseId: "qry_102")
    deactivate API

    activate Promo
    Promo->>Redact: Strip User Names, Roll Numbers & Private IDs
    Redact-->>Promo: Sanitised Question & Human Answer
    Promo->>Promo: Generalise Phrasing & Set Program Visibility ("cs-2026")
    Promo-->>Admin: Present Draft Knowledge Article for Final Approval
    Admin->>Promo: Confirm & Publish Article
    Promo->>KB: Insert Approved Record (status: approved, source: human_promotion)
    KB-->>Promo: Article ID "faq_909" Created
    Promo->>API: Link Case to Created Knowledge ID
    deactivate Promo
```

---

## 5. Class Diagrams (UML Domain Model)

The following Mermaid Class Diagram outlines the complete domain architecture, entity attributes, and relationships governing the Query Router microservice.

```mermaid
classDiagram
    class QueryCase {
        +String id
        +String idempotencyKey
        +String userId
        +String programId
        +QueryChannel channel
        +ExternalRef externalRef
        +String title
        +String body
        +List~AttachmentRef~ attachments
        +Boolean humanRequested
        +AffectedUsers affectedUsers
        +DateTime deadlineAt
        +ClassificationMetadata classification
        +QueryDecision decision
        +List~String~ decisionReasons
        +PriorityLevel priority
        +DateTime slaDueAt
        +QueryStatus status
        +String assignedTeam
        +String assignedTo
        +List~EvidenceRef~ evidence
        +AiDraft aiDraft
        +FinalAnswer finalAnswer
        +String parentIncidentId
        +DateTime createdAt
        +DateTime updatedAt
        +DateTime resolvedAt
        +canTransitionTo(QueryStatus nextStatus) Boolean
        +isSlaBreached() Boolean
    }

    class QueryAuditEvent {
        +String id
        +String queryCaseId
        +String eventType
        +ActorType actorType
        +String actorId
        +QueryStatus fromStatus
        +QueryStatus toStatus
        +List~String~ reasonCodes
        +Map metadata
        +DateTime createdAt
    }

    class ClassificationMetadata {
        +String intent
        +List~String~ categories
        +List~String~ riskTags
        +Boolean requiresPrivateData
        +Boolean requiresPrivilegedAction
        +Float commonalityScore
        +Float retrievalConfidence
        +Float answerConfidence
    }

    class EvidenceRef {
        +SourceType sourceType
        +String sourceId
        +String sourceVersion
        +Float score
        +Boolean approved
        +String programId
    }

    class AiDraft {
        +String text
        +String model
        +String promptVersion
        +Boolean visibleToUser
    }

    class FinalAnswer {
        +String text
        +ActorType actorType
        +String actorId
        +DateTime answeredAt
    }

    class PriorityConfig {
        +PriorityLevel level
        +Integer targetResponseMinutes
        +Boolean bypassCapacityLimit
        +calculateSlaDue(DateTime start) DateTime
    }

    class ChannelAdapter {
        <<interface>>
        +syncIntake(QueryCase queryCase) void
        +syncResolution(QueryCase queryCase) void
    }

    class CommunityPostAdapter {
        +syncIntake(QueryCase queryCase) void
        +syncResolution(QueryCase queryCase) void
    }

    class SupportRequestAdapter {
        +syncIntake(QueryCase queryCase) void
        +syncResolution(QueryCase queryCase) void
    }

    QueryCase "1" *-- "1" ClassificationMetadata : contains
    QueryCase "1" *-- "0..*" EvidenceRef : cites
    QueryCase "1" *-- "0..1" AiDraft : holds
    QueryCase "1" *-- "0..1" FinalAnswer : resolved_by
    QueryCase "1" <-- "0..*" QueryAuditEvent : audited_by
    QueryCase "0..1" <-- "0..*" QueryCase : clustered_under
    ChannelAdapter <|.. CommunityPostAdapter : implements
    ChannelAdapter <|.. SupportRequestAdapter : implements
```

---

## 6. Canonical Data Schemas (TypeScript Domain Definitions)

Below are the production-ready TypeScript interfaces required for implementing the microservice in `apps/query-triage`.

```typescript
export type QueryChannel = 'unified_intake' | 'community' | 'support' | 'faq_search' | 'ask_ai';

export type QueryDecision =
  | 'ai_answer'
  | 'human_required'
  | 'human_review_ai_draft'
  | 'needs_information'
  | 'duplicate_redirect'
  | 'spam_rejected';

export type QueryStatus =
  | 'received'
  | 'triaging'
  | 'awaiting_human'
  | 'assigned'
  | 'waiting_for_user'
  | 'answered'
  | 'resolved'
  | 'closed';

export type PriorityLevel = 'P0' | 'P1' | 'P2' | 'P3';

export type ActorType = 'user' | 'admin' | 'system' | 'ai';

export interface AttachmentRef {
  fileId: string;
  url: string;
  mimeType: string;
  sizeBytes: number;
}

export interface EvidenceRef {
  sourceType: 'faq' | 'community' | 'transcript' | 'policy';
  sourceId: string;
  sourceVersion?: string;
  score: number;
  approved: boolean;
  programId: string;
}

export interface ClassificationMetadata {
  intent: string;
  categories: string[];
  riskTags: string[];
  requiresPrivateData: boolean;
  requiresPrivilegedAction: boolean;
  commonalityScore: number;
  retrievalConfidence: number;
  answerConfidence: number;
}

export interface QueryCase {
  id: string;
  idempotencyKey: string;
  userId: string | null;
  programId: string;
  channel: QueryChannel;
  externalRef?: {
    type: 'CommunityPost' | 'SupportRequest' | 'UnresolvedSearch';
    id: string;
  };

  title: string;
  body: string;
  attachments: AttachmentRef[];
  language?: string;

  humanRequested: boolean;
  affectedUsers?: 'one' | 'several' | 'many' | 'unknown';
  deadlineAt?: string;
  userUrgencyReason?: string;

  classification: ClassificationMetadata;
  decision: QueryDecision;
  decisionReasons: string[];
  policyVersion: string;

  priority: PriorityLevel;
  slaDueAt?: string;
  status: QueryStatus;
  assignedTeam?: string;
  assignedTo?: string;
  parentIncidentId?: string;

  evidence: EvidenceRef[];
  aiDraft?: {
    text: string;
    model: string;
    promptVersion: string;
    visibleToUser: boolean;
  };

  finalAnswer?: {
    text: string;
    actorType: 'ai' | 'human';
    actorId?: string;
    answeredAt: string;
  };

  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
}

export interface QueryAuditEvent {
  id: string;
  queryCaseId: string;
  eventType: string;
  actorType: ActorType;
  actorId?: string;
  fromStatus?: QueryStatus;
  toStatus?: QueryStatus;
  reasonCodes: string[];
  metadata: Record<string, unknown>;
  createdAt: string;
}
```

---

## 7. Priority, SLA & Capacity Management Engine

### 7.1 Priority Matrix Definitions
Priority is determined strictly by **consequence, deadline, and blast radius**—never by user wording intensity or gamification points (Spurti Points).

| Priority | Criteria / Trigger Examples | SLA Initial Response Target | SLA Resolution Target |
| :--- | :--- | :--- | :--- |
| **P0 (Critical)** | Active safety/security breach, data leak, harassment report, system-wide login/assessment outage affecting >50% users. | **15 Minutes** (24/7) | 2 Hours |
| **P1 (High)** | Assessment submission blocked, imminent hard deadline (<24h), outage affecting multiple users (`several`/`many`). | **1 Business Hour** | 4 Business Hours |
| **P2 (Medium)** | Individual account sync failure, attendance discrepancy, payment/fee receipt verification, policy exception request. | **8 Business Hours** | 2 Business Days |
| **P3 (Routine)** | Informational or general curiosity query that lacked an approved FAQ match or had low confidence. | **2 Business Days** | 5 Business Days |

### 7.2 Queue Ordering Formula
Cases in the unified admin inbox are sorted dynamically using a weighted ranking score $S$:

$$S = w_1 \left(\frac{T_{now} - T_{created}}{SLA_{total}}\right) + w_2 (P_{weight}) + w_3 (\log_{10}(U_{affected})) - w_4 (WIP_{penalty})$$

Where:
- $P_{weight}$: $P0=100$, $P1=50$, $P2=20$, $P3=5$.
- $U_{affected}$: Estimated cluster size of linked users.
- Breached SLAs receive an instant $+500$ priority override boost.

### 7.3 Work-In-Progress (WIP) & Capacity Safeguards
To make 2–3 resolvers viable for 1,000+ students:
1. **Per-Resolver WIP Limit:** A resolver cannot hold more than **10 active unclosed cases** (`assigned` or `waiting_for_user`).
2. **Pull-Based Allocation:** Unassigned queries remain in a common pool ordered by score $S$. Resolvers pull work upon completing active tickets rather than receiving unconditional push assignments.
3. **Capacity Threshold Warnings:**
   - **70% Capacity:** Dashboard yellow indicator; recommend deferring optional internal meetings.
   - **90% Capacity:** Orange alert; auto-clustering sensitivity increased from $0.90$ to $0.85$ cosine similarity.
   - **100% Capacity (Overload Mode):** System transparently updates SLA estimates shown to users for `P2`/`P3` queries and alerts Program Directors. **Never silently falls back to AI auto-answering for human-requested queries.**

---

## 8. API Contract Specifications

### 8.1 User Facing REST APIs

#### `POST /v1/queries`
Submits a new query and initiates automated triage.
- **Headers Required:** `Authorization: Bearer <JWT>`, `Idempotency-Key: <UUID>`
- **Request Body:**
  ```json
  {
    "programId": "cs-2026",
    "channel": "unified_intake",
    "title": "Cannot submit assignment #3",
    "body": "Whenever I click upload, it displays a 500 error code.",
    "humanRequested": false,
    "affectedUsers": "several",
    "deadlineAt": "2026-07-02T18:00:00Z"
  }
  ```
- **Response (`202 Accepted`):**
  ```json
  {
    "queryId": "qry_8832a",
    "status": "awaiting_human",
    "decision": "human_required",
    "reasonCodes": ["OUTAGE_REPORTED", "NEAR_DEADLINE"],
    "priority": "P1",
    "slaDueAt": "2026-07-02T08:30:00Z",
    "canRequestHuman": true
  }
  ```

#### `POST /v1/queries/:id/request-human`
Allows a user to explicitly override an AI response or request a human.
- **Request Body:** `{"reason": "AI answer did not address my specific exception"}`
- **Response (`200 OK`):** Updates status to `awaiting_human`, recalculates priority, and returns new SLA estimate.

---

### 8.2 Admin Operational REST APIs

#### `POST /v1/admin/queries/:id/claim`
Atomically assigns an unassigned ticket to the authenticated resolver.
- **Headers Required:** `Authorization: Bearer <AdminJWT>`
- **Response (`200 OK`):**
  ```json
  {
    "queryId": "qry_8832a",
    "status": "assigned",
    "assignedTo": "resolver_kartik",
    "claimedAt": "2026-07-02T07:25:00Z"
  }
  ```

#### `POST /v1/admin/queries/:id/answer`
Publishes an official human response to the student and synchronises linked channel adapters.
- **Request Body:**
  ```json
  {
    "answerText": "We have resolved the backend upload service. Please try submitting again.",
    "resolveImmediately": true,
    "nominateForKnowledge": false
  }
  ```
- **Response (`200 OK`):** Broadcasts resolution notifications to all child cases in the cluster.

---

## 9. Observability, Telemetry & Success Metrics

The microservice emits structured JSON telemetry logs and Prometheus metrics tracking system reliability and quality.

### 9.1 Key Performance Indicators (KPIs)

| Metric Category | Metric Name | Target Benchmark |
| :--- | :--- | :--- |
| **Operational Safety** | **False Automation Rate** (Queries answered by AI that required human intervention) | **0.0% (Zero Tolerance)** |
| **Operational Safety** | Cross-Program Source Violations (RAG citing another program's data) | **0.0%** |
| **Quality** | AI Answer Acceptance Rate (Users clicking 'Yes, this helped') | **>= 82%** |
| **Efficiency** | Repetitive Human Workload Reduction | **>= 65% reduction** |
| **Efficiency** | Incident Cluster Compression Ratio (Child cases per parent ticket) | **>= 5.0x during outages** |
| **Speed** | P0 First Human Response Time | **< 15 Minutes** |
| **Speed** | P1 First Human Response Time | **< 60 Minutes** |

---

## 10. Phased Implementation Roadmap & Acceptance Matrix

### 10.1 Rollout Phases
- **Phase 0: Safety & Scope Remediation (Weeks 1–2):** Patch legacy search endpoints to enforce `programId` filtering and strict `approvedOnly` knowledge flags.
- **Phase 1: Canonical Core Module (Weeks 3–5):** Build `QueryCase` and `QueryAuditEvent` MongoDB schemas inside existing backend. Implement deterministic hard gates.
- **Phase 2: Unified Operational Inbox (Weeks 6–8):** Deliver frontend Admin Operational Dashboard with priority sorting, incident clustering, and atomic claim APIs.
- **Phase 3: Shadow AI & Grounded Automation (Weeks 9–10):** Enable RAG generation in shadow mode. Transition to active automated answers once false automation rate sits at 0%.
- **Phase 4: Microservice Extraction (Weeks 11–12):** Extract bounded context into `apps/query-triage` with event outbox integration.

### 10.2 Acceptance Test Matrix

| Scenario | Input Query & Context | Expected Routing Decision | Expected Priority / Action |
| :--- | :--- | :--- | :--- |
| **1. Routine FAQ** | "What time is today's Python lecture?" (Approved FAQ exists, score 0.94) | `ai_answer` | Automated RAG Response with inline citation card. |
| **2. Human Override** | Same routine query above, but user checks box "I need a human response" | `human_required` | Route to Inbox (`awaiting_human`, `P3`). AI forbidden. |
| **3. Account Dispute** | "My fee payment failed but INR 5000 was debited from my account." | `human_required` | Route to Inbox (`P2`). Requires privileged payment audit. |
| **4. Mass Outage** | 50 students submit: "Cannot access the mock test 502 error." | `human_required` | 1st query becomes `P1` Parent Incident. Next 49 clustered automatically. |
| **5. Cross-Program Leak** | Student in CS-2026 asks about grading. Answer exists only in DataScience-2025 FAQ. | `human_required` | Retrieval excluded by program filter. Escalate to human (`P3`). |
| **6. Stale Source Match** | Query matches a Community post with score 0.91, but post status is `unanswered`. | `human_required` | Unapproved source rejected. Create ticket with private AI draft. |
| **7. Safety Emergency** | "I am feeling extremely depressed and facing severe harassment." | `human_required` | Immediate **`P0` Emergency Case**. Restrict staff visibility, alert Director. |
