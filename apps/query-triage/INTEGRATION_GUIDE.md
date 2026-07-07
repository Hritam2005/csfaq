# Integration Guide: Query Triage Microservice

This guide helps you integrate the Query Triage Microservice with your CSFAQ project.

## Overview

The Query Triage Microservice is designed as an **independent bounded context** that:
1. Can run standalone on its own port (5001)
2. Can be merged into CSFAQ without conflicts
3. Uses the same JWT authentication as CSFAQ
4. Can share MongoDB or use its own database

## Integration Options

### Option 1: Standalone Microservice (Recommended for MVP)

Keep Query Triage as a separate service that communicates via HTTP/REST.

```
┌─────────────────┐      ┌──────────────────────┐
│   CSFAQ         │      │  Query Triage        │
│   (Port 5000)   │      │  (Port 5001)         │
│                 │      │                      │
│  [Submit Query]────────▶│  /api/v1/queries     │
│                 │      │                      │
│                 │◀──────│  WebSocket Events   │
└─────────────────┘      └──────────────────────┘
```

**Pros:**
- Independent deployment
- No merge conflicts with CSFAQ
- Isolated testing

**Cons:**
- Two services to maintain
- Network latency between services

### Option 2: Merge into CSFAQ

Move Query Triage code into CSFAQ and run as a unified application.

#### Step-by-Step Merge

1. **Copy the module:**
```bash
# Copy query-triage module to csfaq
cp -r apps/query-triage/src/modules/query-triage csfaq/server/src/modules/

# Note: The service files are designed to be compatible with csfaq structure
# You may need to adjust imports based on your structure
```

2. **Merge models:**
```javascript
// csfaq/server/src/models/QueryCase.model.js
// Merge the QueryCase schema from query-triage into your existing models
```

3. **Update routes:**
```javascript
// csfaq/server/src/routes/index.js
import queryTriageRoutes from '../modules/query-triage/routes/index.js';
router.use('/query-triage', queryTriageRoutes);
```

4. **Update server.js:**
```javascript
// csfaq/server/server.js
// Add any initialization needed for the query-triage module
```

## Authentication Integration

### Shared JWT Strategy

Both services use the same JWT secret. This allows:
- Users logged into CSFAQ can access Query Triage
- Admin tokens work in both systems

```javascript
// Both services use the same JWT configuration
// .env (in both projects)
JWT_SECRET=shared_secret_here
```

### Token Payload

Query Triage expects JWT payload:
```javascript
{
  userId: "user_id_here",
  roleId: "role_id_here"
  // Optional: roleName for permission checks
  // roleName: "Admin"
}
```

## Database Integration

### Option A: Shared Database

Both services use the same MongoDB:
```env
# query-triage/.env
MONGO_URI=mongodb://localhost:27017/csfaq

# Or use a separate collection prefix
MONGO_URI=mongodb://localhost:27017/csfaq
```

**Note:** Query Triage uses separate collections:
- `querycases` (instead of `queries`)
- `queryauditevents`
- `resolvercapacities`

### Option B: Separate Database

Each service has its own database:
```env
# query-triage/.env
MONGO_URI=mongodb://localhost:27017/query_triage
```

For RAG search, Query Triage can still access CSFAQ's knowledge base through imports.

## Webhook/Event Integration

Query Triage emits WebSocket events:

```javascript
// Client listens for events
io.on('connection', (socket) => {
  // Join user room
  socket.emit('join:user', userId);
  
  // Listen for query updates
  socket.on('query:updated', (data) => {
    console.log('Query updated:', data);
  });
  
  socket.on('query:resolved', (data) => {
    console.log('Query resolved:', data);
  });
});
```

## API Integration Examples

### Submit Query from CSFAQ

```javascript
// In CSFAQ frontend or backend
async function submitQueryToTriage(queryData) {
  const response = await fetch('http://localhost:5001/api/v1/queries', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getCsfaqToken()}`, // Same JWT works
    },
    body: JSON.stringify({
      programId: 'cs-2026',
      title: queryData.title,
      body: queryData.body,
      channel: 'support',
    }),
  });
  
  return response.json();
}
```

### Get Admin Inbox

```javascript
async function getTriageInbox(adminToken) {
  const response = await fetch('http://localhost:5001/api/v1/admin/queries/inbox', {
    headers: {
      'Authorization': `Bearer ${adminToken}`,
    },
  });
  
  return response.json();
}
```

## Environment Variables

### Required for both options:

```env
# Must match CSFAQ
JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_jwt_refresh_secret
CLIENT_URL=http://localhost:3000

# MongoDB
MONGO_URI=mongodb://localhost:27017/your_db
```

## Avoiding Merge Conflicts

The Query Triage module is designed to avoid conflicts:

1. **Separate module path:** `modules/query-triage/`
2. **Separate models:** Uses `QueryCase` not conflicting with existing models
3. **Separate routes:** Can use `/query-triage` prefix
4. **Optional imports:** RAG service gracefully handles missing CSFAQ imports

### File Structure After Merge

```
csfaq/server/src/
├── modules/
│   ├── ... existing modules ...
│   └── query-triage/          # ← New isolated module
│       ├── models/
│       │   ├── QueryCase.model.js
│       │   ├── QueryAuditEvent.model.js
│       │   └── CapacityStatus.model.js
│       ├── services/
│       │   ├── TriageEngine.service.js
│       │   ├── Query.service.js
│       │   ├── RAG.service.js
│       │   ├── Sla.service.js
│       │   ├── Cluster.service.js
│       │   ├── Audit.service.js
│       │   └── Capacity.service.js
│       ├── modules/
│       │   ├── queries/
│       │   │   ├── Query.routes.js
│       │   │   └── Query.controller.js
│       │   └── admin/
│       │       ├── Admin.routes.js
│       │       └── Admin.controller.js
│       ├── constants/
│       │   └── triage.constants.js
│       └── utils/
│           └── ... (shared utilities)
└── routes/
    └── index.js               # Add: router.use('/query-triage', queryTriageRoutes);
```

## Testing the Integration

```bash
# 1. Start CSFAQ
cd csfaq/server && npm run dev

# 2. Start Query Triage
cd apps/query-triage && npm run dev

# 3. Test submission
curl -X POST http://localhost:5001/api/v1/queries \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your_jwt_token>" \
  -d '{
    "programId": "cs-2026",
    "title": "Test Question",
    "body": "This is a test question for the triage system."
  }'

# 4. Check inbox
curl http://localhost:5001/api/v1/admin/queries/inbox \
  -H "Authorization: Bearer <admin_jwt_token>"
```

## Monitoring

Both services should be monitored together:

- Health endpoints at `/api/v1/health`
- Check both services are up
- Aggregate logs from both
