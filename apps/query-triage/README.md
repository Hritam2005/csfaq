# Query Triage Microservice

> Human-First Query Resolution Service - A bounded microservice for the Samagama (CSFAQ) platform.

## Overview

The **Query Triage Microservice** implements the human-first query resolution gateway as specified in `product.md`. It follows the principle: **"AI handles repetition. Humans handle consequence."**

### Key Features

- 🔒 **Hard Human Gates** - Queries requiring privileged action, policy appeals, or safety concerns are automatically routed to humans
- 🔍 **RAG-Powered Automation** - Routine queries with high-confidence knowledge matches are answered automatically
- 📊 **Intelligent Prioritization** - P0/P1/P2/P3 priority with SLA enforcement
- 🔗 **Duplicate Detection** - Automatic incident clustering to resolve 100 tickets with 1 answer
- 📈 **Capacity Management** - Workload balancing with WIP limits for resolvers
- 📝 **Complete Audit Trail** - Every action tracked for compliance

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                      Query Triage Microservice                   │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐ │
│  │  User API   │  │ Admin API   │  │   Health/Metrics API    │ │
│  │ POST /query │  │  Inbox      │  │   GET /health           │ │
│  │ GET /my     │  │  Claim      │  │                         │ │
│  └─────────────┘  │  Answer     │  └─────────────────────────┘ │
│                   └─────────────┘                                │
├─────────────────────────────────────────────────────────────────┤
│                      Core Services                               │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────────────────┐│
│  │ TriageEngine │ │ RAGService   │ │ ClusterService           ││
│  │              │ │              │ │                          ││
│  │ Hard Gates   │ │ Hybrid Search│ │ Duplicate Detection      ││
│  │ Risk Class.  │ │ Citation Ver │ │ Incident Grouping        ││
│  └──────────────┘ └──────────────┘ └──────────────────────────┘│
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────────────────┐│
│  │ SlaService   │ │CapacitySvc   │ │ AuditService             ││
│  │              │ │              │ │                          ││
│  │ SLA Calc     │ │ Workload     │ │ Event Logging            ││
│  │ Due Dates    │ │ Thresholds   │ │ Trail                    ││
│  └──────────────┘ └──────────────┘ └──────────────────────────┘│
├─────────────────────────────────────────────────────────────────┤
│                      Data Layer                                  │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────────────────┐│
│  │  QueryCase   │ │ AuditEvent   │ │ ResolverCapacity         ││
│  │              │ │              │ │                          ││
│  │ Status/Flow  │ │ Event Log    │ │ Workload Status          ││
│  └──────────────┘ └──────────────┘ └──────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
```

## Quick Start

### Prerequisites

- Node.js 20+
- MongoDB 7+
- (Optional) Redis for caching

### Installation

```bash
# Clone and setup
cd apps/query-triage

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Edit .env with your configuration
```

### Running Locally

```bash
# Development mode
npm run dev

# Production mode
npm start
```

### Using Docker

```bash
# Start with Docker Compose
docker-compose up -d

# View logs
docker-compose logs -f query-triage
```

## API Reference

### User Routes

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/queries` | Submit a new query |
| GET | `/api/v1/queries/my-queries` | Get user's queries |
| GET | `/api/v1/queries/:id` | Get query details |
| POST | `/api/v1/queries/:id/request-human` | Request human help |
| POST | `/api/v1/queries/:id/close` | Close resolved query |

### Admin Routes

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/admin/queries/inbox` | Get admin inbox |
| POST | `/api/v1/admin/queries/:id/claim` | Claim a case |
| POST | `/api/v1/admin/queries/:id/unclaim` | Unclaim a case |
| POST | `/api/v1/admin/queries/:id/answer` | Answer a query |
| GET | `/api/v1/admin/queries/:id/incident` | Get incident details |
| GET | `/api/v1/admin/queries/capacity` | Get capacity status |
| GET | `/api/v1/admin/queries/workload` | Get resolver workload |

### Health Routes

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/health` | Basic health check |
| GET | `/api/v1/health/detailed` | Detailed health |
| GET | `/api/v1/health/ready` | Readiness probe |
| GET | `/api/v1/health/live` | Liveness probe |

## Configuration

See `.env.example` for all configuration options:

```env
# Server
NODE_ENV=development
PORT=5001

# Database
MONGO_URI=mongodb://localhost:27017/query_triage

# Authentication (use same JWT secrets as csfaq)
JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_refresh_secret

# Thresholds
MIN_AI_CONFIDENCE=0.85
MEDIUM_AI_CONFIDENCE=0.60
DUPLICATE_SIMILARITY_THRESHOLD=0.90

# Capacity
CAPACITY_WARNING_THRESHOLD=0.70
CAPACITY_CRITICAL_THRESHOLD=0.90
MAX_ACTIVE_CASES_PER_RESOLVER=10
```

## Integration with CSFAQ

### Standalone Mode

The microservice runs independently with its own MongoDB database. It can integrate with CSFAQ's knowledge base for RAG search.

```javascript
// When running standalone, RAG will attempt to use CSFAQ knowledge base
// if csfaq is available on the network:
// import('../../../csfaq/server/src/modules/search/...')
```

### Integration Mode

To fully integrate with CSFAQ:

1. Set `CSFAQ_MONGO_URI` to point to CSFAQ's database
2. Configure `CSFAQ_KB_ENDPOINT` for knowledge base access
3. The service will share authentication with CSFAQ

### Merging into CSFAQ

To merge this microservice into CSFAQ:

1. Copy `apps/query-triage/src/` to `csfaq/server/src/modules/query-triage/`
2. Update `csfaq/server/src/routes/index.js` to include query-triage routes
3. Merge model schemas into your existing models
4. Update `server.js` to initialize query-triage services

## Query Decision Flow

```
User Query
    │
    ▼
┌─────────────┐
│ Hard Gate   │──── YES ───▶ AWAITING_HUMAN
│ Evaluation  │
└─────────────┘
    │ NO
    ▼
┌─────────────┐
│ RAG Search  │
│ (Program    │
│  Scoped)    │
└─────────────┘
    │
    ├── High Confidence (≥0.85) ──▶ AI Answer + Verify
    │
    ├── Medium Confidence (0.60-0.84) ──▶ AWAITING_HUMAN + AI Draft
    │
    └── Low Confidence ──▶ AWAITING_HUMAN
```

## SLA Targets

| Priority | Description | Response SLA | Resolution SLA |
|----------|-------------|--------------|----------------|
| P0 | Safety/Emergency | 15 min | 2 hours |
| P1 | Critical/Blocker | 1 hour | 4 hours |
| P2 | Account Issues | 8 hours | 2 days |
| P3 | General | 48 hours | 5 days |

## Testing

```bash
# Run tests
npm test

# Run with coverage
npm test -- --coverage
```

## Monitoring

The service exports Prometheus-compatible metrics:

- `query_triage_requests_total` - Total requests by endpoint
- `query_triage_response_time_seconds` - Response time histogram
- `query_triage_active_cases` - Current active case count
- `query_triage_capacity_percent` - System capacity percentage

## License

ISC
