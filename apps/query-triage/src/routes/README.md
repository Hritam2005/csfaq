# Query Triage Routes

This directory contains the route definitions for the Query Triage Microservice.

## Structure

```
routes/
├── index.js          # Main router aggregation
└── health.routes.js  # Health check endpoints
```

## Main Module Routes

The actual feature routes are organized in `src/modules/`:

```
src/modules/
├── queries/          # User-facing query routes
│   ├── Query.routes.js
│   └── Query.controller.js
└── admin/            # Admin operational routes
    ├── Admin.routes.js
    └── Admin.controller.js
```

## Route Hierarchy

```
/api/v1/
├── health/*          # Health check routes
├── queries/*         # User query routes
│   ├── POST /            # Submit query
│   ├── GET /my-queries   # User's queries
│   ├── GET /:id          # Query details
│   ├── POST /:id/request-human
│   └── POST /:id/close
└── admin/queries/*   # Admin routes
    ├── GET /inbox
    ├── POST /:id/claim
    ├── POST /:id/unclaim
    ├── POST /:id/answer
    ├── GET /:id/incident
    ├── GET /capacity
    └── GET /workload
```
