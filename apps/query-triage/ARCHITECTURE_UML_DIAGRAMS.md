# 🏗️ Query Triage Microservice: Exhaustive Architecture & UML Diagrams

This document provides a complete suite of **UML and Architectural Diagrams** for the **Query Triage Microservice** (`@csfaq/query-triage`). It is designed to enable engineers, architects, and developers to rapidly understand both the high-level conceptual flow and the exhaustive internal mechanics, domain models, decision workflows, and real-time event orchestration of the system.

---

## 📑 Table of Contents
1. [High-Level Conceptual Architecture (10,000-Foot View)](#1-high-level-conceptual-architecture-10000-foot-view)
2. [RAG Knowledge Engine: What It Does & How It Works](#2-rag-knowledge-engine-what-it-does--how-it-works)
3. [Detailed System Architecture & Component Topology](#3-detailed-system-architecture--component-topology)
4. [Domain Class Diagram & Service Relationships](#4-domain-class-diagram--service-relationships)
5. [Query Triage Decision Tree Flowchart](#5-query-triage-decision-tree-flowchart)
6. [Sequence Diagram: Query Submission & Asynchronous Triage](#6-sequence-diagram-query-submission--asynchronous-triage)
7. [Sequence Diagram: Resolver Claim & Workload WIP Enforcement](#7-sequence-diagram-resolver-claim--workload-wip-enforcement)
8. [Sequence Diagram: Case Resolution & Cascade Incident Closing](#8-sequence-diagram-case-resolution--cascade-incident-closing)

---

## 1. 🌟 High-Level Conceptual Architecture (10,000-Foot View)

This diagram provides an easily understandable, high-level overview of how the microservice operates. It breaks the system down into four intuitive stages: **User Intake**, the automated **Smart Triage Brain**, **Human Staff Protection**, and **Live Resolution**. 

```mermaid
graph TB
    subgraph Intake["1. User Intake"]
        U["👤 Students & Users (Web, Mobile, Portal)"]
    end

    subgraph Brain["2. Smart Triage Brain (Automated Analysis)"]
        HG["🛑 Safety & Policy Guardrails (Flags emergencies, grades & appeals)"]
        RAG["🤖 AI Knowledge Assistant (Searches verified FAQs & verifies citations)"]
        DEDUP["🔗 Smart Deduplication (Groups duplicate questions into 1 cluster)"]
    end

    subgraph Staff["3. Human Staff & Workload Protection"]
        SHIELD["🛡️ Workload Protection Shield (Enforces max 10 active cases per resolver)"]
        DESK["🧑‍🏫 Resolver Dashboard & Inbox (Human-in-the-loop resolution)"]
    end

    subgraph Resolution["4. Resolution & Live Experience"]
        AI_ANS["⚡ Instant Verified AI Answer (For high-confidence standard FAQs)"]
        HUMAN_ANS["📝 Approved Human Answer (With AI-assisted drafting)"]
        CASCADE["🌊 Cascade Resolution (Solving 1 parent ticket closes all duplicates)"]
        LIVE["📡 Real-Time WebSocket Updates (Instant notifications to users & staff)"]
    end

    U -->|Submit Question| HG
    
    HG -->|"Triggered (Emergency / Private)"| SHIELD
    HG -->|"Safe Standard Query"| RAG
    
    RAG -->|"High Confidence (>=85%)"| AI_ANS
    RAG -->|"Needs Human Review / Low Conf"| DEDUP
    
    DEDUP -->|"Grouped or Standalone"| SHIELD
    
    SHIELD -->|"Route to Least-Loaded Staff"| DESK
    
    DESK -->|"Review & Answer"| HUMAN_ANS
    DESK -->|"Resolve Root Issue"| CASCADE
    
    AI_ANS & HUMAN_ANS & CASCADE -->|"Emit Live Events"| LIVE
    LIVE -->|"Update Status"| U
```

### 💡 Why this design works:
1. **Safety First**: Before AI is even consulted, strict rules check for emergencies or private student data (attendance, fees, marks). If found, a human is assigned immediately.
2. **AI with Proof**: AI only answers if it finds verified university policies and can prove at least 30% citation grounding. Otherwise, it drafts an answer for human approval.
3. **No Duplicate Work**: If 50 students ask about the same campus outage or exam schedule, **Smart Deduplication** groups them together. Staff answer once, and **Cascade Resolution** automatically solves all 50 tickets!
4. **Zero Burnout**: The **Workload Protection Shield** ensures no staff member is ever overloaded with more tickets than their defined capacity limit.

---

## 2. 🤖 RAG Knowledge Engine: What It Does & How It Works

The **Retrieval-Augmented Generation (RAG)** engine (`RAGService`) is the core AI intelligence of the microservice. This diagram illustrates exactly **what RAG is doing** to search the university knowledge base and **how it works** to eliminate AI hallucinations before routing answers to students or staff.

```mermaid
flowchart TB
    subgraph Phase1["Phase 1: What RAG Does (Knowledge Retrieval & Isolation)"]
        Q["Incoming Student Query"] --> Filter["1. Program-Scoped KB Search (Strictly filter by student's Program ID)"]
        Filter --> StatusCheck["2. Official Doc Filter (Only use Published or Approved docs)"]
        StatusCheck --> Score["3. Relevance & Commonality Scoring (Vector similarity + historical popularity)"]
    end

    subgraph Phase2["Phase 2: How It Works (Hallucination Prevention & Verification)"]
        Score --> Docs["Retrieved Knowledge Base Documents"]
        Docs --> CiteCheck{"Citation Grounding Check (Do >= 30% of query terms match source text?)"}
        
        CiteCheck -- "Yes (Grounded)" --> ContraCheck{"Contradiction Detection (Do retrieved policies conflict with each other?)"}
        CiteCheck -- "No (Hallucination Risk)" --> Fail["Verification Failed (Safety Fallback)"]
        
        ContraCheck -- "No Contradictions" --> Pass["Verification Passed"]
        ContraCheck -- "Conflict Detected!" --> Fail
    end

    subgraph Phase3["Phase 3: Three-Tier Routing Outcomes"]
        Pass --> ConfCheck{"RAG Confidence Score"}
        Fail --> MediumRoute["Tier 2: Human Review AI Draft (AI writes draft answer for staff to review)"]
        
        ConfCheck -- "High Conf (>= 85%) & Commonality (>= 70%)" --> Tier1["Tier 1: Instant AI Answer (Status: ANSWERED instantly to student)"]
        ConfCheck -- "Medium Conf (60% - 84%)" --> MediumRoute
        ConfCheck -- "Low Conf (< 60%)" --> Tier3["Tier 3: Human Required (Route directly to staff desk)"]
    end
```

### 🔍 Deep-Dive: What RAG is Doing vs. How It Works

#### What RAG is Doing (Retrieval & Filtering):
- **Multi-Tenant Knowledge Isolation**: When a query arrives, RAG never searches a global bucket. It strictly scopes retrieval to the student's specific `programId` (e.g., Computer Science vs. Business Administration), ensuring policy cross-contamination is impossible.
- **Editorial Quality Control**: It filters out draft or outdated documents, searching exclusively within official FAQs and policy handbooks marked as `published` or `approved`.
- **Hybrid Scoring**: It ranks retrieved documents by combining vector semantic similarity with **Commonality Scoring** (how frequently a specific policy document has historically resolved similar student issues).

#### How It Works (Hallucination Prevention & Safety Routing):
To prevent the Large Language Model (LLM) from inventing fake university rules or guessing answers, the RAG engine enforces two mandatory mathematical checks:
1. **Citation Grounding Check (The 30% Rule)**: The engine extracts key vocabulary terms ($>3$ characters) from the student's question and verifies that **at least 30% of those exact terms physically exist** inside the retrieved official documents. If an LLM tries to answer from general pre-training rather than official university text, this check fails!
2. **Contradiction Detection**: If multiple retrieved policy documents contain conflicting statements (e.g., Document A says "fee deadline is Friday" while Document B says "deadline is Monday"), the system detects the contradiction and aborts automatic answering.
3. **Three-Tier Safety Routing**:
   - **Tier 1 (Instant AI Answer)**: When confidence is $\ge 85\%$, commonality is high, citations are verified, and no contradictions exist, the AI delivers an instant, verified answer to the student.
   - **Tier 2 (AI Draft for Human Review)**: When confidence is moderate ($60\% - 84\%$) or if citation grounding fails, the AI writes a **Draft Answer** (`aiDraft`) behind the scenes. The student does not see it; instead, the ticket routes to human staff who can review, edit, and approve the AI's draft in one click.
   - **Tier 3 (Human Required)**: When confidence is low ($< 60\%$), the AI steps aside entirely and routes the ticket straight to human staff.

---

## 3. 🌐 Detailed System Architecture & Component Topology

The diagram below illustrates the comprehensive technical architecture of the `@csfaq/query-triage` microservice. It highlights the boundary layers between external client channels, the API gateway, core Express middlewares, domain services, real-time WebSocket rooms, and data persistence layers.

```mermaid
graph TB
    subgraph Clients["External Clients & Intake Channels"]
        C1["Web / Mobile App"]
        C2["Community Portal"]
        C3["Support Center"]
        C4["Unified Intake / FAQ"]
    end

    subgraph Gateway["API Gateway & Security Layer"]
        LB["Load Balancer / Reverse Proxy"]
        SEC["Security Layer (Helmet, CORS, Rate Limiter)"]
        AUTH["Auth Middleware (JWT Validation & RBAC)"]
    end

    subgraph CoreApp["Query Triage Microservice (Express / Node.js ESM)"]
        subgraph Controllers["API Controller Layer"]
            QC["Query Controller (/api/v1/queries)"]
            AC["Admin Controller (/api/v1/admin/queries)"]
            HC["Health Controller (/api/v1/health)"]
        end

        subgraph Services["Core Engine & Domain Services"]
            QS["QueryService (Lifecycle Orchestrator)"]
            TE["TriageEngine (Decision & Hard Gates)"]
            RAG["RAGService (Knowledge Verification & Citations)"]
            CS["ClusterService (Semantic Deduplication & TF-Cosine)"]
            SLA["SlaService (Business Hours & Due Dates)"]
            CAP["CapacityService (WIP Limits & Workload)"]
            AUD["AuditService (Immutable Event Logging)"]
        end
    end

    subgraph RealTime["Real-Time WebSocket Layer"]
        SIO["Socket.IO Server"]
        R_USER["Room: user:userId"]
        R_PROG["Room: program:programId"]
        R_RES["Room: resolver:resolverId"]
    end

    subgraph Persistence["Data & External Integrations"]
        MDB["MongoDB (Mongoose ODM)"]
        LLM["OpenAI API (LLM Embeddings & Generation)"]
        LOG["Winston Logger (Daily Rotate File Stream)"]
    end

    C1 & C2 & C3 & C4 -->|HTTP / REST| LB
    LB --> SEC
    SEC --> AUTH
    AUTH --> Controllers
    QC & AC --> QS
    QS --> TE
    TE --> RAG
    TE --> CS
    QS --> SLA
    QS & AC --> CAP
    QS --> AUD

    RAG -->|Vector Search & Prompting| LLM
    QS & TE & RAG & CS & SLA & CAP & AUD -->|CRUD & Queries| MDB
    QS & AC -->|Emit Events| SIO
    SIO --> R_USER & R_PROG & R_RES
    CoreApp -->|Structured JSON Logs| LOG
```

### Key Technical Highlights:
- **Human-First Triage Paradigm**: AI is utilized as a high-speed drafting and classification assistant, but hard safety and operational gates enforce human verification for sensitive queries.
- **Asynchronous Non-Blocking Processing**: Heavy AI/RAG retrieval, vector similarity calculations, and clustering run asynchronously in background event loops (`setImmediate`), allowing the submission endpoint to respond instantly with `202 Accepted`.
- **Work-In-Progress (WIP) Protection**: The system actively protects human resolvers from burnout by enforcing strict active case ceilings (e.g., max 10 active cases) and pull-based routing.

---

## 4. 🧩 Domain Class Diagram & Service Relationships

This class diagram models the core domain entities (`QueryCase`, `QueryAuditEvent`, `ResolverCapacity`, `CapacitySnapshot`) and their interactions with stateless business logic services.

```mermaid
classDiagram
    class QueryCase {
        +String idempotencyKey
        +ObjectId userId
        +ObjectId programId
        +String channel
        +Object classification
        +String decision
        +String priority
        +Date slaDueAt
        +String status
        +ObjectId parentIncidentId
        +Boolean isParentIncident
        +Object aiDraft
        +Object finalAnswer
        +canTransitionTo(nextStatus) Boolean
        +calculatePriority(queryData)$ String
    }

    class QueryAuditEvent {
        +ObjectId queryCaseId
        +String eventType
        +String actorType
        +ObjectId actorId
        +String fromStatus
        +String toStatus
        +Object metadata
        +Date createdAt
    }

    class ResolverCapacity {
        +ObjectId resolverId
        +Number maxCases
        +Number activeCases
        +Number capacityPercent
        +String status
        +Date lastUpdated
    }

    class CapacitySnapshot {
        +Date timestamp
        +Number totalActiveCases
        +Number activeResolvers
        +Number avgCapacityPercent
        +Number breachedSlaCount
    }

    class QueryService {
        +submitQuery(data, user) Promise~Object~
        +processTriage(queryId) Promise~void~
        +claimCase(queryId, resolverId, resolverName) Promise~Object~
        +unclaimCase(queryId, resolverId) Promise~Object~
        +answerQuery(queryId, answerData, resolverId) Promise~Object~
        +getAdminInbox(filters, user) Promise~Array~
    }

    class TriageEngine {
        +evaluateHardGates(query) Object
        +classifyQuery(queryText) Object
        +executeTriage(queryCase) Promise~Object~
    }

    class RAGService {
        +retrieve(queryText, programId) Promise~Array~
        +verifyCitations(queryText, retrievedDocs) Boolean
        +checkContradictions(retrievedDocs) Boolean
        +verifyAndGenerate(queryText, programId) Promise~Object~
    }

    class ClusterService {
        +tokenize(text) Array~String~
        +calculateTermFrequency(tokens) Object
        +calculateSimilarity(vecA, vecB) Number
        +findPotentialDuplicate(queryCase) Promise~Object~
    }

    class SlaService {
        +calculateSlaDueAt(priority, createdAt) Date
        +addBusinessHours(startDate, hours) Date
        +getSlaStatus(slaDueAt) String
    }

    class CapacityService {
        +getSystemCapacity() Promise~Object~
        +canAcceptCases(resolverId) Promise~Boolean~
        +getAvailableResolvers(programId) Promise~Array~
        +incrementActiveCases(resolverId) Promise~void~
        +decrementActiveCases(resolverId) Promise~void~
    }

    class AuditService {
        +logEvent(eventData) Promise~void~
        +getCaseHistory(queryCaseId) Promise~Array~
    }

    QueryCase "1" <-- "0..*" QueryAuditEvent : audited by
    QueryCase "1" <-- "0..*" QueryCase : parent-child cluster
    QueryService --> QueryCase : manages lifecycle
    QueryService --> TriageEngine : delegates triage
    QueryService --> SlaService : computes deadlines
    QueryService --> CapacityService : enforces WIP limits
    QueryService --> AuditService : records audit trail
    TriageEngine --> RAGService : retrieves & verifies KB
    TriageEngine --> ClusterService : deduplicates queries
```

---

## 5. 🔀 Query Triage Decision Tree Flowchart

The flowchart below traces the exact decision path executed by the `TriageEngine` when a newly submitted query enters the `TRIAGING` state. It demonstrates how **Hard Human Gates**, **RAG Confidence Scoring**, and **Semantic Clustering** determine the final routing decision.

```mermaid
flowchart TD
    Start["New Query Entered (Status: RECEIVED)"] --> TriageInit["Transition to Status: TRIAGING"]
    
    subgraph HardGates["Step 1: Hard Human Gates Evaluation"]
        HG1{"User Requested Human?"}
        HG2{"Safety / Emergency Keywords Detected?"}
        HG3{"Privileged Data Required? (Marks, Attendance, Fees)"}
        HG4{"Policy Appeal / Fee Waiver Requested?"}
        HG5{"Near SLA Deadline? (< 24 Hours)"}
    end

    TriageInit --> HG1
    HG1 -- Yes --> GateTriggered["Hard Gate Triggered: Human Required"]
    HG1 -- No --> HG2
    HG2 -- Yes --> GateTriggered
    HG2 -- No --> HG3
    HG3 -- Yes --> GateTriggered
    HG3 -- No --> HG4
    HG4 -- Yes --> GateTriggered
    HG4 -- No --> HG5
    HG5 -- Yes --> GateTriggered

    GateTriggered --> CalcPrio["Calculate Priority (P0 / P1 / P2)"]
    CalcPrio --> RouteHuman["Route to AWAITING_HUMAN (Decision: HUMAN_REQUIRED)"]

    HG5 -- No --> Classify["Step 2: Risk & Intent Classification (Problem, Info, Request, Complaint)"]
    
    subgraph RAGFlow["Step 3 & 4: RAG Knowledge Retrieval & Verification"]
        Classify --> Retrieve["Retrieve Program-Scoped KB Docs (Status: Published/Approved)"]
        Retrieve --> ScoreCheck{"RAG Confidence & Commonality Score"}
        
        ScoreCheck -- "High Conf (>= 0.85) & Commonality (>= 0.70)" --> VerifyCite{"Citation Grounding Check (>= 30% Terms Match)"}
        ScoreCheck -- "Medium Conf (0.60 - 0.84)" --> GenDraft["Generate AI Draft Answer (Hidden from User)"]
        ScoreCheck -- "Low Conf (< 0.60)" --> RouteHuman

        VerifyCite -- "Verified & No Contradictions" --> RouteAI["Route to AI_ANSWER (Status: ANSWERED)"]
        VerifyCite -- "Verification Failed / Contradiction" --> GenDraft
        
        GenDraft --> RouteReview["Route to AWAITING_HUMAN (Decision: HUMAN_REVIEW_AI_DRAFT)"]
    end

    subgraph ClusterFlow["Step 5: Semantic Clustering & Deduplication"]
        RouteAI --> Dedup["Calculate Cosine Similarity against Recent Open Cases"]
        RouteReview --> Dedup
        RouteHuman --> Dedup
        
        Dedup --> SimCheck{"Similarity >= 0.90? (or 0.85 in Overload)"}
        SimCheck -- Yes --> LinkParent["Link to Parent Incident (Set parentIncidentId)"]
        SimCheck -- No --> Standalone["Remain Standalone Case"]
    end

    LinkParent --> End["Triage Complete (Emit Socket.IO Events)"]
    Standalone --> End
```

---

## 6. ⚡ Sequence Diagram: Query Submission & Asynchronous Triage

This sequence diagram details the end-user query submission lifecycle. It highlights the **idempotency check**, immediate HTTP `202 Accepted` response, and the non-blocking background execution of the triage pipeline.

```mermaid
sequenceDiagram
    autonumber
    actor User as End User
    participant API as API Gateway / Router
    participant QC as QueryController
    participant QS as QueryService
    participant DB as MongoDB (QueryCase)
    participant AUD as AuditService
    participant TE as TriageEngine
    participant RAG as RAGService
    participant CS as ClusterService
    participant SIO as Socket.IO Server

    User->>API: POST /api/v1/queries (Payload + IdempotencyKey)
    API->>QC: Route Request (Validate Joi Schema)
    QC->>QS: submitQuery(data, user)
    QS->>DB: findOne(idempotencyKey)
    alt Duplicate Request Found
        DB-->>QS: Return Existing QueryCase
        QS-->>QC: Return { isIdempotent: true, case }
        QC-->>User: HTTP 200 OK (Existing Case Returned)
    else New Request
        QS->>DB: create(QueryCase in RECEIVED state)
        DB-->>QS: New QueryCase Saved
        QS->>AUD: logEvent(created, actor: user)
        QS-->>QC: Return New Case
        QC-->>User: HTTP 202 Accepted (Triage Started)
        
        Note over QS, CS: Asynchronous Non-Blocking Triage (setImmediate)
        QS->>TE: executeTriage(queryCase)
        TE->>DB: updateStatus(TRIAGING)
        TE->>TE: evaluateHardGates()
        TE->>TE: classifyQuery()
        
        alt Hard Gate Triggered or Low Confidence
            TE->>DB: update(decision: HUMAN_REQUIRED, status: AWAITING_HUMAN)
        else High Confidence RAG
            TE->>RAG: retrieve(queryText, programId)
            RAG-->>TE: Retrieved Docs & Score
            TE->>RAG: verifyCitations(queryText, docs)
            RAG-->>TE: Verified True
            TE->>DB: update(decision: AI_ANSWER, status: ANSWERED, finalAnswer)
        else Medium Confidence RAG
            TE->>RAG: generateDraft()
            RAG-->>TE: AI Draft Text
            TE->>DB: update(decision: HUMAN_REVIEW_AI_DRAFT, status: AWAITING_HUMAN, aiDraft)
        end
        
        TE->>CS: findPotentialDuplicate(queryCase)
        CS->>DB: search recent open cases (48h scope)
        DB-->>CS: Candidate cases
        CS->>CS: compute Cosine Similarity
        alt Similarity >= 0.90
            CS->>DB: update(parentIncidentId, isParentIncident=true on target)
        end
        
        TE-->>QS: Triage Complete
        QS->>AUD: logEvent(triage_started / status_changed)
        QS->>SIO: emit('query:updated', userRoom, programRoom)
        SIO-->>User: WebSocket Notification (Status Update)
    end
```

---

## 7. 🛡️ Sequence Diagram: Resolver Claim & Workload WIP Enforcement

This sequence diagram illustrates how admin/resolvers claim tickets from the triage queue. It demonstrates how `CapacityService` acts as a protective shield against burnout by checking real-time Work-In-Progress (WIP) limits before permitting a state transition to `ASSIGNED`.

```mermaid
sequenceDiagram
    autonumber
    actor Res as Human Resolver
    participant AC as AdminController
    participant QS as QueryService
    participant CAP as CapacityService
    participant DB as MongoDB
    participant AUD as AuditService
    participant SIO as Socket.IO Server

    Res->>AC: POST /api/v1/admin/queries/:id/claim
    AC->>QS: claimCase(queryId, resolverId, resolverName)
    QS->>DB: findById(queryId)
    DB-->>QS: QueryCase (Status: AWAITING_HUMAN)
    
    QS->>QS: canTransitionTo('ASSIGNED')
    
    QS->>CAP: canAcceptCases(resolverId)
    CAP->>DB: findOne(ResolverCapacity)
    DB-->>CAP: activeCases = 8, maxCases = 10
    
    alt activeCases >= maxCases (WIP Limit Reached)
        CAP-->>QS: return false
        QS-->>AC: throw ApiError(409 Conflict: Resolver at max capacity)
        AC-->>Res: HTTP 409 Conflict (WIP Limit Exceeded)
    else Capacity Available (activeCases < maxCases)
        CAP-->>QS: return true
        QS->>DB: update(status: ASSIGNED, assignedTo: resolverId)
        QS->>CAP: incrementActiveCases(resolverId)
        CAP->>DB: update(activeCases + 1, capacityPercent)
        QS->>AUD: logEvent(assigned, actor: admin/resolver)
        QS->>SIO: emit('query:assigned', userRoom, resolverRoom)
        SIO-->>Res: WebSocket Notification (Case Claimed)
        QS-->>AC: Return Updated QueryCase
        AC-->>Res: HTTP 200 OK (Case Claimed Successfully)
    end
```

---

## 8. 🌊 Sequence Diagram: Case Resolution & Cascade Incident Closing

This sequence diagram depicts the resolution workflow. Crucially, when a resolver answers a **Parent Incident** (`isParentIncident === true`), the system executes a **Cascade Resolution**, automatically closing all linked duplicate child tickets and freeing up workload capacity across the resolver pool.

```mermaid
sequenceDiagram
    autonumber
    actor Res as Human Resolver
    participant AC as AdminController
    participant QS as QueryService
    participant DB as MongoDB (QueryCase)
    participant CAP as CapacityService
    participant AUD as AuditService
    participant SIO as Socket.IO Server

    Res->>AC: POST /api/v1/admin/queries/:id/answer (Payload: answerText, resolveImmediately=true)
    AC->>QS: answerQuery(queryId, answerData, resolverId)
    QS->>DB: findById(queryId)
    DB-->>QS: Parent QueryCase (Status: ASSIGNED, isParentIncident: true)
    
    QS->>QS: canTransitionTo('RESOLVED')
    QS->>DB: update(status: RESOLVED, finalAnswer: answerText, resolvedAt: now)
    QS->>CAP: decrementActiveCases(resolverId)
    CAP->>DB: update(activeCases - 1)
    QS->>AUD: logEvent(answered, actor: resolver)
    QS->>SIO: emit('query:resolved', userRoom)
    
    Note over QS, DB: Cascade Resolution of Linked Child Incidents
    alt isParentIncident === true
        QS->>DB: find({ parentIncidentId: queryId, status: { $ne: CLOSED } })
        DB-->>QS: Array of Child QueryCases [Child1, Child2, ...]
        
        loop For Each Child Case
            QS->>DB: updateChild(status: RESOLVED, finalAnswer: "Resolved via Parent Incident #queryId: " + answerText)
            alt Child was assigned to a resolver
                QS->>CAP: decrementActiveCases(child.assignedTo)
            end
            QS->>AUD: logEvent(status_changed to RESOLVED via cascade, actor: system)
            QS->>SIO: emit('query:resolved', childUserRoom)
        end
    end

    QS-->>AC: Return Resolved Case & Cascade Summary
    AC-->>Res: HTTP 200 OK (Resolution Saved & Child Cases Updated)
```

---
*Created by Antigravity AI Coding Assistant for Samagama / CSFAQ Query Triage Microservice.*
