# 📘 How To Use The CSFAQ Microservices (Frontend + Backend + Query‑Triage)

This guide explains how to run the **three services** together, log in with the **pre‑seeded dummy accounts**, and exercise every Query‑Triage feature through the React UI and the REST / Socket.IO APIs.

---

## 1. 🧩 Services At A Glance

| Layer         | Folder                              | Default Port | Tech                | Purpose                                                            |
| ------------- | ----------------------------------- | ------------ | ------------------- | ------------------------------------------------------------------ |
| **Main API**  | `server/`                           | `5000`       | Node.js + Express   | Auth (JWT), users, documents, knowledge base, etc.                 |
| **Triage API**| `apps/query-triage/`                | `4000`       | Node.js + MongoDB   | Queries, incidents, capacity, workload, SLA + realtime Socket.IO   |
| **Frontend**  | `client/`                           | `5173`       | React + Vite        | UI for both user‑facing flow and admin Triage Inbox                 |

You can launch all three with the convenience batch files at the repo root:

```
run-server.bat     ← starts the main backend   (port 5000)
run-triage.bat     ← starts the triage microservice (port 4000)
run-client.bat     ← starts the Vite frontend  (port 5173)
```

Run them in **three separate terminals** so each keeps its own log.

---

## 2. ⚙️ One‑Time Setup (already in place, but for reference)

### 2.1 Install dependencies
```bash
npm install                       # at repo root (if root package.json ever exists)
npm install --prefix server       # main backend
npm install --prefix apps/query-triage   # triage microservice
npm install --prefix client       # frontend
```

### 2.2 Environment files
| File                       | Key vars                                                               |
| -------------------------- | ---------------------------------------------------------------------- |
| `server/.env`              | `MONGO_URI`, `JWT_SECRET`, `JWT_REFRESH_SECRET`, `TRIAGE_MONGO_URI`, `TRIAGE_DB_NAME`, `PORT=5000` |
| `apps/query-triage/.env`   | `MONGO_URI`, `JWT_SECRET` *(must match server's)*, `PORT=4000`, `CLIENT_ORIGIN=http://localhost:5173` |
| `client/.env`              | `VITE_API_BASE_URL=http://localhost:5000/api`, `VITE_TRIAGE_URL=http://localhost:4000/api/triage`, `VITE_TRIAGE_SOCKET_URL=http://localhost:4000`, `VITE_ENABLE_TRIAGE_SOCKETS=true` |

> 🔑 **The `JWT_SECRET` MUST be identical** in `server/.env` and `apps/query-triage/.env` — the triage service trusts only tokens signed by the same secret.

### 2.3 Cross-DB authentication (query-triage)
The query-triage microservice keeps its own `users` collection in a **separate** MongoDB database (`csfaq_triage`). To let those accounts log in through the main backend the `server/.env` carries two extra variables:

| Var                       | Default                | Purpose                                       |
| ------------------------- | ---------------------- | --------------------------------------------- |
| `TRIAGE_MONGO_URI`        | (empty – falls back)   | Mongo URI of the `csfaq_triage` database      |
| `TRIAGE_DB_NAME`          | `csfaq_triage`         | DB name to query on the fallback connection   |

When a user POSTs to `/api/auth/login` and the email is **not** present in the main `csfaq_main.users` collection, the auth service opens a secondary Mongo connection to this database, bcrypt-verifies the password against the triage record, and automatically provisions a **mirror user** in the main DB (keeping the same `_id` so the JWT stays valid against both services). The provisioning maps the triage role string → main-DB role document:

| Triage DB `role` | Main DB `roles.name` |
| ---------------- | -------------------- |
| `admin` / `resolver` | `System Administrator` |
| `user`           | `Registered User`     |

This means **all seeded accounts** in the seed script (Alice, Bryan, Carla, Diana, Evan, …) work out-of-the-box on the main frontend without you having to copy them by hand.

### 2.4 Seed databases
```bash
# Main backend — creates the System Administrator + role
node --prefix server seed_admin.js

# Triage microservice — creates 3 admins + 7 users, 15 queries,
# 5 capacity records, 5 snapshots, 20 audit events
node --prefix apps/query-triage src/scripts/seedDummyData.js
# add  --reset  to wipe existing demo rows first
```

---

## 3. 🔐 Dummy Accounts (already seeded)

> ✅ All Triage users below share the **same password**: `Demo@123`
> The main‑server admin has a **separate** password.

### 3.1 Main‑backend admin (for everything that is *not* the triage flow)
| Role | Email                  | Username | Password            | Notes                       |
| ---- | ---------------------- | -------- | ------------------- | --------------------------- |
| Admin | `admin@example.com`     | `admin`  | `AdminPassword123!` | Routes you into `/admin`…   |

> ℹ️ This account is what the **Navbar / AdminLayout** uses to gate the `/admin/…` pages.

### 3.2 Triage microservice — Admins / Resolvers
| # | Name           | Email                          | Team   | Password    |
| - | -------------- | ------------------------------ | ------ | ----------- |
| 1 | Alice Admin    | `alice.admin@csfaq.local`      | triage | `Demo@123`  |
| 2 | Bryan Resolver | `bryan.resolver@csfaq.local`   | triage | `Demo@123`  |
| 3 | Carla Resolver | `carla.resolver@csfaq.local`   | triage | `Demo@123`  |

### 3.3 Triage microservice — Regular Users
| # | Name         | Email                       | Password   |
| - | ------------ | --------------------------- | ---------- |
| 1 | Diana Doe    | `diana.doe@csfaq.local`     | `Demo@123` |
| 2 | Evan Edwards | `evan.edwards@csfaq.local`  | `Demo@123` |
| 3 | Fiona Foster | `fiona.foster@csfaq.local`  | `Demo@123` |
| 4 | George Gupta | `george.gupta@csfaq.local`  | `Demo@123` |
| 5 | Hira Hassan  | `hira.hassan@csfaq.local`   | `Demo@123` |
| 6 | Ivan Iyer    | `ivan.iyer@csfaq.local`     | `Demo@123` |
| 7 | Jaya Joshi   | `jaya.joshi@csfaq.local`    | `Demo@123` |

> 📌 The triage “role” field stored on each user is `admin` (resolvers) or `user`. The JWT issued by the main backend carries a separate `role: "Admin" | "User"` that the **frontend** uses for routing — the two role systems are intentionally independent.

---

## 4. 🚀 Running The Full Stack

### Step 1 — Main backend
```bash
run-server.bat
# logs land in server.log
```
Look for:  `Server running on http://localhost:5000`

### Step 2 — Triage microservice
```bash
run-triage.bat
# logs land in triage.log
```
Look for:  `Query‑Triage API running on http://localhost:4000`

### Step 3 — Frontend
```bash
run-client.bat
# logs land in client.log
```
Open **http://localhost:5173** in your browser.

---

## 5. 🧭 Using The UI (Quick Walkthroughs)

### 5.1 Regular user journey
1. Go to **http://localhost:5173/login** → log in with e.g. `diana.doe@csfaq.local` / `Demo@123`.
2. The navbar now shows **“Submit a Query”**.
3. Click it (or visit `/queries/new`) → fill the form:
   - **Title** – e.g. *"Mobile app crashes on startup"*
   - **Body** – description (markdown is supported in the read view)
   - **Priority hint** – *Low / Medium / High / Urgent*
   - **Human‑assistance toggle** – check to skip AI handling
   - **Optional attachments** – drag‑and‑drop
4. Submit → you’re redirected to `/queries/my-queries` (My Queries list).
5. Click a query → `/queries/:id` shows the live status, SLI countdown, comments thread, and any AI draft.
6. If the resolver responds, the page updates in real time via Socket.IO without refresh.

### 5.2 Admin / Triage resolver journey
1. Log out → log in with `alice.admin@csfaq.local` / `Demo@123` (or any of the other admins).
2. The navbar now shows **“Triage Queue”**.
3. The sidebar shows a new **“Triage & Support”** group:
   - **Inbox** – `/admin/triage/inbox` – every queued query, filter by priority / status / SLA breach.
   - **Capacity** – `/admin/triage/capacity` – per‑resolver load and system capacity cards.
   - **Workload** – `/admin/triage/workload` – reassign cases between resolvers.
4. From the **Inbox**, open any card to reach `/admin/triage/queries/:id`:
   - Change **status** (Received → Triaging → Awaiting‑Human → Assigned … Resolved → Closed).
   - Change **priority** (P0–P3) and SLA timer auto‑recomputes.
   - **Assign to** yourself or another resolver.
   - Post an **internal note** (visible only to admins) or a **public reply** (visible to the user).
   - **Attach a final answer** – marks the case `answered`.
   - **Resolve** and **Close** – optional satisfaction rating prompt flows back to the user.
5. **Incident cluster** – open any parent incident (e.g. the seeded case titled *"Cannot reset password — email not received"*) to see all child queries grouped under it (`/admin/triage/incidents/:id`).

### 5.3 Dashboard shortcuts
| Page                            | What you see                                                                                                    |
| ------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| `/dashboard` (user)             | Welcome + **“Open queries”** stat card + CTA **“Submit a Query”**.                                              |
| `/admin` (admin)                | Live **capacity** stat card + CTAs **“Open Triage Inbox”**, **“Manage Capacity”**, **“View Workload”**.         |

---

## 6. 🔌 API Reference (for Postman / curl / scripts)

All routes are mounted on the **main backend** (`http://localhost:5000`) under `/api/triage/…` *after* being **proxied by Vite** in dev (`/api/triage → localhost:4000`). Both URLs work.

### 6.1 Auth — login (issues the JWT the rest of the API expects)
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"alice.admin@csfaq.local","password":"Demo@123"}'
```
Save the returned `token` for the next calls (or use the **Bearer** header set by the axios interceptor in the UI).

### 6.2 Query‑Triage routes — quick matrix

| Method | Path (after `/api/triage`)            | Who    | Purpose                                              |
| ------ | ------------------------------------- | ------ | ---------------------------------------------------- |
| POST   | `/queries`                            | user   | Create a new query (`Idempotency-Key` header recommended) |
| GET    | `/queries/mine`                       | user   | List of queries *I* created                           |
| GET    | `/queries/:id`                        | any    | Full query + comments + audit                         |
| PATCH  | `/queries/:id/cancel`                 | owner  | Cancel before assignment                             |
| POST   | `/queries/:id/comments`               | any    | Add a public comment                                 |
| POST   | `/queries/:id/internal-notes`         | admin  | Add an internal note                                 |
| POST   | `/queries/:id/rate`                   | owner  | Submit satisfaction rating                           |
| POST   | `/queries/:id/attachments`            | owner  | Upload attachment (multipart)                         |
| GET    | `/resolver/queries`                   | admin  | Triage queue (filter `?status=&priority=`)           |
| PATCH  | `/resolver/queries/:id/assign`        | admin  | Assign / unassign                                    |
| PATCH  | `/resolver/queries/:id/status`        | admin  | Change status                                        |
| PATCH  | `/resolver/queries/:id/priority`      | admin  | Change priority (recomputes SLA)                     |
| POST   | `/resolver/queries/:id/resolve`       | admin  | Mark resolved                                        |
| GET    | `/incidents`                          | admin  | List parent incidents                                |
| GET    | `/incidents/:id`                      | admin  | Incident detail + child cases                        |
| PATCH  | `/incidents/:id`                      | admin  | Update incident metadata                             |
| POST   | `/incidents/:id/escalate`             | admin  | Escalate incident                                    |
| GET    | `/resolver/capacity`                  | admin  | Per‑resolver capacity snapshot                       |
| POST   | `/resolver/capacity/bulk`             | admin  | Bulk update capacity thresholds                      |
| GET    | `/resolver/capacity/history`          | admin  | Historical capacity snapshots (chart data)           |
| GET    | `/resolver/workload`                  | admin  | Workload distribution                                |
| POST   | `/resolver/workload/reassign`         | admin  | Reassign cases between resolvers                     |
| GET    | `/stats/dashboard`                    | admin  | Aggregated KPIs for the admin dashboard              |

> The Vite dev server also proxies `/api/*` → `http://localhost:5000`, so the frontend never has to deal with CORS.

#### Sample admin GET — fetch the triage queue
```bash
curl http://localhost:5000/api/triage/resolver/queries \
  -H "Authorization: Bearer <JWT>" \
  -H "X-Admin-Bypass: 1"            # only needed if your build requires it
```

#### Sample user POST — create a query
```bash
curl -X POST http://localhost:5000/api/triage/queries \
  -H "Authorization: Bearer <JWT>" \
  -H "Content-Type: application/json" \
  -H "Idempotency-Key: $(uuidgen)" \
  -d '{
    "title": "Cannot upload PDFs larger than 25 MB",
    "body": "Browser hangs at 99% on Chrome 126.",
    "programId": "csfaq-main",
    "channel": "unified_intake",
    "humanRequested": false,
    "classification": { "intent": "bug_report", "categories": ["documents"] },
    "affectedUsers": "one"
  }'
```

### 6.3 Realtime — Socket.IO
* **Endpoint**: `ws://localhost:4000` (proxied the same way in dev)
* **Handshake**: pass the JWT in `auth.token` — the server verifies it via the shared `JWT_ACCESS_SECRET`.
* **Rooms**: each user gets `user:<id>`; each resolver gets `resolver:<id>` and `resolver-team`.
* **Events emitted by server**:
  | Event               | Payload shape                                              |
  | ------------------- | ----------------------------------------------------------- |
  | `query:created`     | full `QueryCase`                                           |
  | `query:updated`     | partial fields + `updatedBy`                               |
  | `query:status`      | `{ id, from, to, actorRole }`                              |
  | `query:assigned`    | `{ id, assigneeId, assigneeName }`                        |
  | `query:commented`   | `{ id, comment }`                                          |
  | `incident:updated`  | `{ id, …diff }`                                            |
  | `capacity:snapshot` | capacity snapshot payload                                   |
  | `workload:changed`  | `{ resolverId, activeCases }`                              |
* **Client helper already wired** in `client/src/services/triage/triageSocket.ts` + `client/src/hooks/triage/useTriageSocket.ts` — it auto‑connects, reconnects with exponential back‑off, and re‑joins rooms after token refresh.

Quick smoke test from CLI (`node`):
```js
// terminal-only check that the socket accepts the admin JWT
const { io } = require('socket.io-client');
const sock = io('http://localhost:4000', { auth: { token: 'PASTE_JWT' } });
sock.on('connect', () => console.log('connected'));
sock.on('query:updated', (q) => console.log('update', q._id));
```

---

## 7. 🛠️ Local dev scripts you might find handy

```bash
# Generate a long-lived JWT for the first seeded admin (handy for Postman)
node apps/query-triage/src/scripts/makeTestToken.js
# prints:  ADMIN_ID=…  ADMIN_NAME=…  TOKEN=…

# Wipe all demo rows (keeps real production data untouched)
node apps/query-triage/src/scripts/seedDummyData.js --reset

# Reset the main-server admin password
node server/seed_admin.js
```

---

## 8. ✅ End‑to‑End Smoke Test (≈ 60 seconds)

1. Start **three** services (see §4).
2. Open `http://localhost:5173` in two **different** browsers (or one incognito).
3. In browser **A** log in as `diana.doe@csfaq.local` / `Demo@123` and submit a new query.
4. In browser **B** log in as `alice.admin@csfaq.local` / `Demo@123` and open the **Triage Inbox**.
5. Assign Diana’s query to **yourself**, change status → Assigned, post a public reply.
6. Watch browser **A** — the query’s status badge and the new comment appear in real time, no refresh needed.
7. In browser **B**, go to **Capacity** — the active‑case counter for Alice has gone up.
8. In browser **A** mark the query resolved → the satisfaction rating modal pops.
9. 🎉 You have exercised **REST + Socket.IO + RBAC routing + dashboard stats** in one flow.

---

## 9. 🆘 Troubleshooting

| Symptom                                 | Fix                                                                                  |
| --------------------------------------- | ------------------------------------------------------------------------------------ |
| Frontend says *“401 Unauthorized”*      | Token expired (15 min default). Just sign in again; the axios interceptor auto‑refreshes. |
| Socket never connects                   | Check `VITE_TRIAGE_SOCKET_URL` in `client/.env`, and confirm `CLIENT_ORIGIN` in `apps/query-triage/.env` matches the frontend URL. |
| Inbox is empty                          | Re‑seed: `node apps/query-triage/src/scripts/seedDummyData.js` (or create a query as a user). |
| “CORS” errors in the console            | Make sure both backend `.env` files include `CLIENT_ORIGIN=http://localhost:5173`.   |
| Token rejected by triage microservice   | `JWT_ACCESS_SECRET` mismatched between `server/.env` and `apps/query-triage/.env`.  |
| TypeScript build fails (`npm run build`)| Re‑install client deps; all newly‑added types live under `client/src/services/triage/` and `client/src/hooks/triage/`. |

---

Happy triaging! 🚑
