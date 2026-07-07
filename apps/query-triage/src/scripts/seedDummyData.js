/**
 * Seed Script: Dummy Data for Query Triage Microservice
 *
 * Run: node src/scripts/seedDummyData.js [--reset]
 *
 *   --reset   Wipe the target collections before inserting (default: append)
 *
 * Connects to the MongoDB Atlas URI specified in apps/query-triage/.env
 * and inserts demo data into the csfaq_triage database so that the
 * frontend pages have content to render.
 *
 * Inserts:
 *   - users (10): 3 admins / triage resolvers + 7 regular users
 *   - querycases (15): spread across all priorities & statuses
 *   - resolvercapacities (5): per-resolver load
 *   - capacitysnapshots (5):  system-wide snapshots
 *   - queryauditevents (20): lifecycle events
 *
 * Two of the cases are grouped into a parent incident cluster.
 */

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment from the microservice .env
dotenv.config({ path: path.join(__dirname, '../../.env') });

const RESET = process.argv.includes('--reset');

// ---------- helpers ---------------------------------------------------------

const hoursAgo = (h) => new Date(Date.now() - h * 60 * 60 * 1000);
const daysAgo = (d) => new Date(Date.now() - d * 24 * 60 * 60 * 1000);
const daysAhead = (d) => new Date(Date.now() + d * 24 * 60 * 60 * 1000);

const CHOICES = (arr) => arr[Math.floor(Math.random() * arr.length)];

const PRIORITIES = ['P0', 'P1', 'P2', 'P3'];
const STATUSES = [
  'received', 'triaging', 'awaiting_human', 'assigned',
  'waiting_for_user', 'answered', 'resolved', 'closed',
];
const CHANNELS = ['unified_intake', 'community', 'support', 'faq_search', 'ask_ai'];
const DECISIONS = [
  'ai_answer', 'human_required', 'human_review_ai_draft',
  'needs_information', 'duplicate_redirect', 'spam_rejected',
];
const PROGRAMS = ['csfaq-main', 'csfaq-admin', 'csfaq-mobile', 'csfaq-onboarding'];
const INTENTS = ['how_to', 'bug_report', 'account_issue', 'policy_question',
  'feature_request', 'data_export', 'integration_help', 'auth_issue'];
const CATEGORIES = ['account', 'billing', 'auth', 'ui', 'api', 'mobile',
  'documents', 'knowledge_base', 'notifications', 'integrations'];
const RISK_TAGS = ['pii', 'privileged', 'audit_logged', 'rate_limited',
  'external_dep', 'high_volume', 'low_confidence'];

// ---------- data ------------------------------------------------------------

const USERS = [
  { name: 'Alice Admin',     email: 'alice.admin@csfaq.local',    role: 'admin',  team: 'triage'    },
  { name: 'Bryan Resolver',  email: 'bryan.resolver@csfaq.local', role: 'admin',  team: 'triage'    },
  { name: 'Carla Resolver',  email: 'carla.resolver@csfaq.local', role: 'admin',  team: 'triage'    },
  { name: 'Diana Doe',       email: 'diana.doe@csfaq.local',      role: 'user'                    },
  { name: 'Evan Edwards',    email: 'evan.edwards@csfaq.local',   role: 'user'                    },
  { name: 'Fiona Foster',    email: 'fiona.foster@csfaq.local',   role: 'user'                    },
  { name: 'George Gupta',    email: 'george.gupta@csfaq.local',   role: 'user'                    },
  { name: 'Hira Hassan',     email: 'hira.hassan@csfaq.local',    role: 'user'                    },
  { name: 'Ivan Iyer',       email: 'ivan.iyer@csfaq.local',      role: 'user'                    },
  { name: 'Jaya Joshi',      email: 'jaya.joshi@csfaq.local',     role: 'user'                    },
];

const QUERY_SEED_TITLES = [
  'Cannot reset password — email not received',
  'Mobile app crashes on startup (Android 14)',
  'Need to export all my documents at once',
  'How do I add a custom knowledge base source?',
  'Billing question: prorated refund for cancelled plan',
  'API returns 502 intermittently since yesterday',
  'Account locked after too many failed logins',
  'Want to integrate Slack notifications for new answers',
  'Document upload stuck at 99% for large PDFs',
  'How to invite a teammate who already has an account',
  'GDPR data export request — how long does it take?',
  'Community post flagged as spam incorrectly',
  'Two-factor auth code not arriving via SMS',
  'Need to change organisation name on our workspace',
  'Search returns no results even for exact phrases',
];

// Map priority -> SLA window in hours (matches the microservice defaults)
const SLA_HOURS = { P0: 2, P1: 4, P2: 48, P3: 120 };

// ---------- main ------------------------------------------------------------

async function main() {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.error('❌ MONGO_URI is not set. Check apps/query-triage/.env');
    process.exit(1);
  }

  console.log(`🔌 Connecting to MongoDB Atlas…`);
  await mongoose.connect(uri);
  console.log('✅ Connected:', mongoose.connection.name);

  const db = mongoose.connection.db;

  // ---- collections -----------------------------------------------------
  const usersCol         = db.collection('users');
  const queriesCol       = db.collection('querycases');
  const capacitiesCol    = db.collection('resolvercapacities');
  const snapshotsCol     = db.collection('capacitysnapshots');
  const auditsCol        = db.collection('queryauditevents');

  if (RESET) {
    console.log('🗑️  --reset flag set: clearing existing demo data');
    await Promise.all([
      usersCol.deleteMany({ demo: true }),
      queriesCol.deleteMany({ demo: true }),
      capacitiesCol.deleteMany({ demo: true }),
      snapshotsCol.deleteMany({ demo: true }),
      auditsCol.deleteMany({ demo: true }),
    ]);
  }

  // ---------- USERS ------------------------------------------------------
  const passwordHash = await bcrypt.hash('Demo@123', 10);
  const userDocs = USERS.map((u, i) => ({
    _id: new mongoose.Types.ObjectId(),
    name: u.name,
    email: u.email,
    password: passwordHash,
    role: u.role,
    team: u.team || null,
    isActive: true,
    demo: true,
    createdAt: daysAgo(30 - i),
    updatedAt: daysAgo(30 - i),
  }));
  await usersCol.insertMany(userDocs);
  console.log(`👥 Inserted ${userDocs.length} users`);

  const adminIds  = userDocs.filter((u) => u.role === 'admin').map((u) => u._id);
  const userIds   = userDocs.filter((u) => u.role === 'user').map((u) => u._id);

  // ---------- QUERIES ----------------------------------------------------
  const queryDocs = [];
  const auditDocs = [];

  // First two queries form a parent incident cluster
  const parentIncidentId = new mongoose.Types.ObjectId();

  QUERY_SEED_TITLES.forEach((title, i) => {
    const created = hoursAgo(1 + i * 6);          // spaced over last ~3.5 days
    const priority = CHOICES(PRIORITIES);
    const status   = CHOICES(STATUSES);
    const channel  = CHOICES(CHANNELS);
    const decision = CHOICES(DECISIONS);
    const program  = CHOICES(PROGRAMS);
    const intent   = CHOICES(INTENTS);
    const cats     = Array.from(new Set([CHOICES(CATEGORIES), CHOICES(CATEGORIES)]));
    const risks    = Math.random() > 0.6 ? [CHOICES(RISK_TAGS)] : [];
    const slaDueAt = new Date(created.getTime() + SLA_HOURS[priority] * 3600_000);

    const isClosed  = status === 'closed'  || status === 'resolved';
    const isAnswered = status === 'answered' || isClosed;
    const isAssigned = ['assigned', 'waiting_for_user', 'answered', 'resolved', 'closed'].includes(status);

    const authorId  = CHOICES(userIds);
    const assignedTo = isAssigned ? String(CHOICES(adminIds)) : null;

    const comments = [];
    const commentCount = 1 + Math.floor(Math.random() * 3);
    for (let c = 0; c < commentCount; c++) {
      const isAdmin = Math.random() > 0.5;
      comments.push({
        _id: new mongoose.Types.ObjectId(),
        authorId: String(isAdmin ? CHOICES(adminIds) : authorId),
        authorName: isAdmin
          ? USERS.find((u) => u._id === undefined).name // placeholder, replaced below
          : USERS[USERS.findIndex((u) => true)].name,
        authorRole: isAdmin ? 'admin' : 'user',
        body: isAdmin
          ? `Hi — I'm looking into this now. ${CHOICES([
              'Can you share a screenshot?',
              'Could you confirm the exact error message?',
              'Are you still seeing this issue?',
              'We pushed a fix in the last release — please retry.',
            ])}`
          : CHOICES([
              'I tried again but still no luck.',
              'This is blocking our team. Please help ASAP.',
              'I attached a screenshot for reference.',
              'This worked yesterday, not sure what changed.',
              'Thanks for the quick response!',
            ]),
        createdAt: new Date(created.getTime() + (c + 1) * 30 * 60_000),
      });
    }

    // Replace placeholder names
    comments.forEach((c) => {
      const author = userDocs.find((u) => String(u._id) === String(c.authorId));
      if (author) c.authorName = author.name;
    });

    const finalAnswer = isAnswered
      ? {
          text: CHOICES([
            'Thanks for reaching out — this has been fixed in our latest release. Please refresh and try again.',
            'We have identified the root cause and pushed a hotfix. Could you confirm it now works on your end?',
            'This is a known limitation of the free tier. Upgrading to Pro unlocks the feature you need.',
            'I have manually triggered the export for your account. You should receive an email within 10 minutes.',
            'Please try the workaround described in our docs: Settings → Integrations → Reset Connection.',
          ]),
          actorType: 'admin',
          actorId: assignedTo || String(CHOICES(adminIds)),
          answeredAt: new Date(created.getTime() + 2 * 3600_000),
        }
      : null;

    const closedAt = status === 'closed' ? new Date(created.getTime() + 6 * 3600_000) : null;
    const resolvedAt = isClosed ? new Date(created.getTime() + 5 * 3600_000) : null;

    // First two are part of an incident cluster
    const isParent = i === 0;
    const isChild  = i === 1;

    const doc = {
      _id: new mongoose.Types.ObjectId(),
      idempotencyKey: `demo-${i}-${Date.now()}`,
      userId: String(authorId),
      userName: userDocs.find((u) => String(u._id) === String(authorId))?.name,
      programId: program,
      channel,
      externalRef: null,
      title,
      body: `Detailed description for "${title}". ${CHOICES([
        'I have been running into this issue for the past 2 days.',
        'This started happening after the latest update.',
        'Affects multiple members of my team.',
        'Happens consistently every time I try the action.',
      ])}`,
      attachments: [],
      language: 'en',
      humanRequested: decision === 'human_required' || decision === 'human_review_ai_draft',
      humanRequestReason: decision === 'human_required' ? 'User explicitly asked to talk to a human' : null,
      affectedUsers: CHOICES(['one', 'one', 'one', 'several', 'many']),
      deadlineAt: priority === 'P0' || priority === 'P1' ? daysAhead(1) : null,
      userUrgencyReason: priority === 'P0' ? 'Production is down' : null,
      classification: {
        intent,
        categories: cats,
        riskTags: risks,
        requiresPrivateData: risks.includes('pii'),
        requiresPrivilegedAction: risks.includes('privileged'),
        commonalityScore: Math.random(),
        retrievalConfidence: 0.4 + Math.random() * 0.6,
        answerConfidence: decision === 'ai_answer' ? 0.7 + Math.random() * 0.3 : 0.3 + Math.random() * 0.4,
      },
      decision,
      decisionReasons: [CHOICES([
        'OUTAGE_REPORTED', 'PRIVILEGED_DATA_REQUIRED', 'BLOCKED_SUBMISSION',
        'NEEDS_MORE_INFO', 'LOW_CONFIDENCE', 'POLICY_VIOLATION', 'DUPLICATE_FOUND',
      ])],
      policyVersion: '1.0',
      priority,
      slaDueAt,
      status,
      assignedTeam: isAssigned ? 'triage' : null,
      assignedTo,
      claimedAt: isAssigned ? new Date(created.getTime() + 30 * 60_000) : null,
      parentIncidentId: isChild ? parentIncidentId : null,
      isParentIncident: isParent,
      linkedCaseCount: isParent ? 1 : 0,
      evidence: [],
      aiDraft: decision === 'ai_answer' || decision === 'human_review_ai_draft'
        ? {
            text: 'Based on our knowledge base, this issue is usually caused by… (demo AI draft)',
            model: 'qwen2.5-coder-1.5b',
            promptVersion: 'v1.2',
            visibleToUser: false,
          }
        : null,
      finalAnswer,
      comments,
      userSatisfaction: status === 'closed' ? CHOICES(['satisfied', 'unsatisfied', 'no_feedback']) : null,
      userFeedback: null,
      createdAt: created,
      updatedAt: created,
      resolvedAt,
      closedAt,
      isDeleted: false,
      demo: true,
    };

    // If this is the parent, attach its own ID as the parentIncidentId
    if (isParent) {
      doc._id = parentIncidentId;
      doc.parentIncidentId = parentIncidentId;
    }

    queryDocs.push(doc);

    // Build audit events for each case
    const eventTypes = [
      { type: 'created',     actor: 'user',   from: null,        to: 'received'        },
      { type: 'triaged',     actor: 'system', from: 'received',   to: 'triaging'        },
    ];
    if (decision !== 'spam_rejected') {
      eventTypes.push({ type: 'ai_classified', actor: 'ai',  from: 'triaging',        to: 'triaging' });
      eventTypes.push({ type: 'routed',        actor: 'system', from: 'triaging',    to: 'awaiting_human' });
    }
    if (isAssigned) eventTypes.push({ type: 'assigned', actor: 'admin', from: 'awaiting_human', to: 'assigned' });
    if (status === 'answered' || isClosed) eventTypes.push({ type: 'answered', actor: 'admin', from: 'assigned', to: 'answered' });
    if (status === 'resolved' || status === 'closed') eventTypes.push({ type: 'resolved', actor: 'admin', from: 'answered', to: 'resolved' });
    if (status === 'closed') eventTypes.push({ type: 'closed', actor: 'admin', from: 'resolved', to: 'closed' });

    let cursor = new Date(created.getTime() + 5 * 60_000);
    eventTypes.forEach((ev) => {
      auditDocs.push({
        _id: new mongoose.Types.ObjectId(),
        queryCaseId: doc._id,
        eventType: ev.type,
        actorType: ev.actor,
        actorId: ev.actor === 'admin' ? (assignedTo || String(CHOICES(adminIds))) : (ev.actor === 'user' ? String(authorId) : 'system'),
        fromStatus: ev.from,
        toStatus: ev.to,
        reasonCodes: [],
        metadata: { source: 'demo-seed' },
        ipAddress: '127.0.0.1',
        userAgent: 'seed-script/1.0',
        createdAt: cursor,
        updatedAt: cursor,
        demo: true,
      });
      cursor = new Date(cursor.getTime() + 10 * 60_000);
    });
  });

  await queriesCol.insertMany(queryDocs);
  await auditsCol.insertMany(auditDocs);
  console.log(`📨 Inserted ${queryDocs.length} queries and ${auditDocs.length} audit events`);

  // ---------- CAPACITY (resolvers) --------------------------------------
  const capacityDocs = adminIds.map((id, i) => {
    const activeCases = i === 0 ? 8 : i === 1 ? 5 : 2;
    return {
      _id: new mongoose.Types.ObjectId(),
      resolverId: String(id),
      resolverName: userDocs.find((u) => String(u._id) === String(id))?.name || 'Unknown',
      activeCases,
      capacityPercent: activeCases * 10,
      lastUpdated: new Date(),
      status: activeCases >= 8 ? 'busy' : activeCases >= 5 ? 'available' : 'available',
      demo: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  });
  await capacitiesCol.insertMany(capacityDocs);
  console.log(`📊 Inserted ${capacityDocs.length} resolver capacity records`);

  // ---------- CAPACITY SNAPSHOTS ----------------------------------------
  const snapshotDocs = [3, 2, 1, 0.5, 0].map((daysBack, idx) => {
    const totalActive = 22 - idx * 2;
    const avg = 50 + idx * 6;
    return {
      _id: new mongoose.Types.ObjectId(),
      timestamp: daysAgo(daysBack),
      totalActiveCases: totalActive,
      totalResolvers: adminIds.length,
      averageCapacityPercent: avg,
      status: avg >= 90 ? 'overload' : avg >= 70 ? 'warning' : avg >= 50 ? 'watch' : 'normal',
      breachedCases: idx === 0 ? 2 : 0,
      details: { note: 'demo snapshot' },
      demo: true,
      createdAt: daysAgo(daysBack),
      updatedAt: daysAgo(daysBack),
    };
  });
  await snapshotsCol.insertMany(snapshotDocs);
  console.log(`📈 Inserted ${snapshotDocs.length} capacity snapshots`);

  // ---------- summary ----------------------------------------------------
  const counts = {
    users:        await usersCol.countDocuments({ demo: true }),
    queries:      await queriesCol.countDocuments({ demo: true }),
    audits:       await auditsCol.countDocuments({ demo: true }),
    capacities:   await capacitiesCol.countDocuments({ demo: true }),
    snapshots:    await snapshotsCol.countDocuments({ demo: true }),
  };
  console.log('\n🎉 Seed complete!');
  console.table(counts);

  console.log('\n🔑 Demo login (for testing the triage pages via the main server):');
  console.log('   user:    diana.doe@csfaq.local   / Demo@123');
  console.log('   admin:   alice.admin@csfaq.local / Demo@123');

  await mongoose.disconnect();
  process.exit(0);
}

main().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});