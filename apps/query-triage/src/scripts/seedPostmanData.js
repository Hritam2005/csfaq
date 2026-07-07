/**
 * Seed Script for Postman / Manual Testing
 * 
 * Run: node src/scripts/seedPostmanData.js
 * 
 * Generates test users, long-lived JWT tokens (30 days), sample query cases across
 * various priorities (P0-P3) and statuses, and resolver workload data.
 * Outputs all tokens and IDs to console and writes postman_test_data.json.
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../.env') });

import { generateAccessToken } from '../utils/jwt.util.js';
import QueryCase, { QueryStatus, QueryDecision, PriorityLevel, QueryChannel } from '../models/QueryCase.model.js';
import { ResolverCapacity } from '../models/CapacityStatus.model.js';
import QueryAuditEvent from '../models/QueryAuditEvent.model.js';

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/query_triage';

async function seedPostmanData() {
  try {
    console.log('🔗 Connecting to MongoDB:', MONGO_URI);
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB.');

    // 1. Clear previous test data
    console.log('🗑️  Clearing existing QueryCases, ResolverCapacities, and AuditEvents...');
    await QueryCase.deleteMany({});
    await ResolverCapacity.deleteMany({});
    await QueryAuditEvent.deleteMany({});

    // 2. Generate Long-Lived JWT Tokens (30 Days) for Postman Testing
    console.log('🔑 Generating Postman JWT Bearer Tokens (Valid for 30 days)...');
    
    const studentToken = generateAccessToken({
      userId: 'user_student_01',
      roleId: 'role_student',
      roleName: 'Student',
      fullName: 'Alice Student',
      email: 'alice@csfaq.local'
    });

    const adminToken = generateAccessToken({
      userId: 'resolver_admin_01',
      roleId: 'role_admin',
      roleName: 'Admin',
      fullName: 'Triage Lead Admin',
      email: 'admin@csfaq.local'
    });

    const resolverToken = generateAccessToken({
      userId: 'resolver_agent_02',
      roleId: 'role_resolver',
      roleName: 'Resolver',
      fullName: 'Charlie Support Resolver',
      email: 'charlie@csfaq.local'
    });

    // 3. Seed Sample QueryCases
    console.log('🌱 Seeding realistic sample QueryCases across P0-P3 priorities...');
    
    const now = new Date();

    // Case 1: P0 Safety Emergency (Awaiting Human)
    const caseP0 = await QueryCase.create({
      idempotencyKey: 'postman-case-p0-001',
      userId: 'user_student_01',
      programId: 'prog_cs_2026',
      channel: QueryChannel.UNIFIED_INTAKE,
      title: 'EMERGENCY: Physical security threat reported near computer lab',
      body: 'URGENT: There is an immediate safety hazard and danger reported in the basement server lab area. Someone needs to check immediately.',
      humanRequested: true,
      humanRequestReason: 'Immediate safety hazard',
      affectedUsers: 'many',
      priority: PriorityLevel.P0,
      status: QueryStatus.AWAITING_HUMAN,
      decision: QueryDecision.HUMAN_REQUIRED,
      decisionReasons: ['SAFETY_EMERGENCY'],
      slaDueAt: new Date(now.getTime() + 15 * 60 * 1000), // Due in 15 mins
      createdAt: new Date(now.getTime() - 5 * 60 * 1000),
    });

    // Case 2: P1 Near Deadline Submission Blocker (Awaiting Human)
    const caseP1 = await QueryCase.create({
      idempotencyKey: 'postman-case-p1-002',
      userId: 'user_student_01',
      programId: 'prog_cs_2026',
      channel: QueryChannel.UNIFIED_INTAKE,
      title: 'Cannot access assignment grading portal before tonight deadline',
      body: 'Whenever I click upload submission on portal, I get a 500 server error. My deadline is in 4 hours!',
      affectedUsers: 'several',
      deadlineAt: new Date(now.getTime() + 4 * 60 * 60 * 1000),
      priority: PriorityLevel.P1,
      status: QueryStatus.AWAITING_HUMAN,
      decision: QueryDecision.HUMAN_REQUIRED,
      decisionReasons: ['NEAR_DEADLINE'],
      slaDueAt: new Date(now.getTime() + 1 * 60 * 60 * 1000), // Due in 1 hr
      createdAt: new Date(now.getTime() - 20 * 60 * 1000),
    });

    // Case 3: P2 Assigned Fee Payment Discrepancy (Assigned to Admin)
    const caseP2 = await QueryCase.create({
      idempotencyKey: 'postman-case-p2-003',
      userId: 'user_student_02',
      programId: 'prog_cs_2026',
      channel: QueryChannel.SUPPORT,
      title: 'Tuition fee payment debited but receipt shows unpaid balance',
      body: 'Transaction ID #TXN98765 completed yesterday but my student balance still says 500 due.',
      priority: PriorityLevel.P2,
      status: QueryStatus.ASSIGNED,
      decision: QueryDecision.HUMAN_REQUIRED,
      decisionReasons: ['PRIVILEGED_DATA_REQUIRED'],
      assignedTo: 'resolver_admin_01',
      claimedAt: new Date(now.getTime() - 60 * 60 * 1000),
      slaDueAt: new Date(now.getTime() + 8 * 60 * 60 * 1000),
      createdAt: new Date(now.getTime() - 2 * 60 * 60 * 1000),
    });

    // Case 4: P3 Routine Library Hours (Answered by AI)
    const caseP3 = await QueryCase.create({
      idempotencyKey: 'postman-case-p3-004',
      userId: 'user_student_01',
      programId: 'prog_cs_2026',
      channel: QueryChannel.ASK_AI,
      title: 'What are the weekend opening hours for the central science library?',
      body: 'I need to know if the library study halls are open on Sundays.',
      priority: PriorityLevel.P3,
      status: QueryStatus.ANSWERED,
      decision: QueryDecision.AI_ANSWER,
      decisionReasons: ['HIGH_CONFIDENCE_RAG'],
      finalAnswer: {
        text: 'The Central Science Library is open from 9:00 AM to 8:00 PM on Saturdays and Sundays during regular semester weeks.',
        actorType: 'ai',
        answeredAt: new Date(now.getTime() - 10 * 60 * 1000),
      },
      createdAt: new Date(now.getTime() - 15 * 60 * 1000),
    });

    // Case 5: Parent Incident Cluster (Assigned to Charlie Resolver)
    const caseParent = await QueryCase.create({
      idempotencyKey: 'postman-case-parent-005',
      userId: 'user_student_03',
      programId: 'prog_cs_2026',
      channel: QueryChannel.UNIFIED_INTAKE,
      title: 'Campus Wi-Fi authentication server down in Engineering Block',
      body: 'Nobody in Engineering Block 3 can connect to Eduroam Wi-Fi since 10 AM.',
      affectedUsers: 'many',
      priority: PriorityLevel.P1,
      status: QueryStatus.ASSIGNED,
      assignedTo: 'resolver_agent_02',
      claimedAt: new Date(),
      isParentIncident: true,
      linkedCaseCount: 3,
      slaDueAt: new Date(now.getTime() + 3 * 60 * 60 * 1000),
      createdAt: new Date(now.getTime() - 30 * 60 * 1000),
    });

    // 4. Seed Resolver Capacities
    console.log('📊 Seeding ResolverCapacity entries...');
    await ResolverCapacity.create([
      {
        resolverId: 'resolver_admin_01',
        resolverName: 'Triage Lead Admin',
        activeCases: 1,
        capacityPercent: 0.1,
        status: 'available',
      },
      {
        resolverId: 'resolver_agent_02',
        resolverName: 'Charlie Support Resolver',
        activeCases: 1,
        capacityPercent: 0.1,
        status: 'available',
      }
    ]);

    // 5. Output valid Postman Collection v2.1.0 schema
    const postmanCollection = {
      info: {
        _postman_id: 'query-triage-collection-v1',
        name: 'Query Triage Microservice API Collection',
        description: `Auto-generated Postman API Collection on ${new Date().toISOString()} with live 30-day Bearer tokens and seeded MongoDB IDs.`,
        schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json'
      },
      variable: [
        { key: 'baseUrl', value: 'http://localhost:5001/api/v1', type: 'string' },
        { key: 'studentToken', value: studentToken, type: 'string' },
        { key: 'adminToken', value: adminToken, type: 'string' },
        { key: 'p0Id', value: caseP0._id.toString(), type: 'string' },
        { key: 'p1Id', value: caseP1._id.toString(), type: 'string' },
        { key: 'p2Id', value: caseP2._id.toString(), type: 'string' }
      ],
      item: [
        {
          name: '1. User Endpoints',
          item: [
            {
              name: 'Submit New Query',
              request: {
                method: 'POST',
                header: [
                  { key: 'Authorization', value: 'Bearer {{studentToken}}' },
                  { key: 'Content-Type', value: 'application/json' }
                ],
                body: {
                  mode: 'raw',
                  raw: JSON.stringify({
                    programId: 'prog_cs_2026',
                    title: 'Attendance discrepancy in lab section B',
                    body: 'My attendance for yesterday was marked absent despite signing the lab register.',
                    humanRequested: false
                  }, null, 2)
                },
                url: {
                  raw: '{{baseUrl}}/queries',
                  host: ['{{baseUrl}}'],
                  path: ['queries']
                }
              }
            },
            {
              name: 'Submit VINS FAQ Query (NOC Rules)',
              request: {
                method: 'POST',
                header: [
                  { key: 'Authorization', value: 'Bearer {{studentToken}}' },
                  { key: 'Content-Type', value: 'application/json' }
                ],
                body: {
                  mode: 'raw',
                  raw: JSON.stringify({
                    programId: 'prog_vins_2026',
                    title: 'Can my HOD email the NOC instead of uploading?',
                    body: 'Is it okay if my Head of Department sends my signed NOC directly over email?',
                    humanRequested: false
                  }, null, 2)
                },
                url: {
                  raw: '{{baseUrl}}/queries',
                  host: ['{{baseUrl}}'],
                  path: ['queries']
                }
              }
            },
            {
              name: 'Submit VINS FAQ Query (Rosetta AI Policy)',
              request: {
                method: 'POST',
                header: [
                  { key: 'Authorization', value: 'Bearer {{studentToken}}' },
                  { key: 'Content-Type', value: 'application/json' }
                ],
                body: {
                  mode: 'raw',
                  raw: JSON.stringify({
                    programId: 'prog_vins_2026',
                    title: 'Can I use ChatGPT to write my daily Rosetta journal entries?',
                    body: 'I am busy with coding tasks today. Am I allowed to generate my Rosetta reflection using AI tools?',
                    humanRequested: false
                  }, null, 2)
                },
                url: {
                  raw: '{{baseUrl}}/queries',
                  host: ['{{baseUrl}}'],
                  path: ['queries']
                }
              }
            },
            {
              name: 'Get My Queries',
              request: {
                method: 'GET',
                header: [
                  { key: 'Authorization', value: 'Bearer {{studentToken}}' }
                ],
                url: {
                  raw: '{{baseUrl}}/queries/my-queries',
                  host: ['{{baseUrl}}'],
                  path: ['queries', 'my-queries']
                }
              }
            }
          ]
        },
        {
          name: '2. Admin Endpoints',
          item: [
            {
              name: 'Get Unified Triage Inbox',
              request: {
                method: 'GET',
                header: [
                  { key: 'Authorization', value: 'Bearer {{adminToken}}' }
                ],
                url: {
                  raw: '{{baseUrl}}/admin/queries/inbox?status[]=awaiting_human&status[]=assigned',
                  host: ['{{baseUrl}}'],
                  path: ['admin', 'queries', 'inbox'],
                  query: [
                    { key: 'status[]', value: 'awaiting_human' },
                    { key: 'status[]', value: 'assigned' }
                  ]
                }
              }
            },
            {
              name: 'Claim P1 Case',
              request: {
                method: 'POST',
                header: [
                  { key: 'Authorization', value: 'Bearer {{adminToken}}' },
                  { key: 'Content-Type', value: 'application/json' }
                ],
                body: {
                  mode: 'raw',
                  raw: JSON.stringify({ resolverName: 'Triage Lead Admin' }, null, 2)
                },
                url: {
                  raw: '{{baseUrl}}/admin/queries/{{p1Id}}/claim',
                  host: ['{{baseUrl}}'],
                  path: ['admin', 'queries', '{{p1Id}}', 'claim']
                }
              }
            },
            {
              name: 'Answer Claimed Case',
              request: {
                method: 'POST',
                header: [
                  { key: 'Authorization', value: 'Bearer {{adminToken}}' },
                  { key: 'Content-Type', value: 'application/json' }
                ],
                body: {
                  mode: 'raw',
                  raw: JSON.stringify({
                    answerText: 'We have manually reconciled your student account ledger. The 500 fee balance has been cleared.',
                    resolveImmediately: true
                  }, null, 2)
                },
                url: {
                  raw: '{{baseUrl}}/admin/queries/{{p2Id}}/answer',
                  host: ['{{baseUrl}}'],
                  path: ['admin', 'queries', '{{p2Id}}', 'answer']
                }
              }
            },
            {
              name: 'Get System Capacity Stats',
              request: {
                method: 'GET',
                header: [
                  { key: 'Authorization', value: 'Bearer {{adminToken}}' }
                ],
                url: {
                  raw: '{{baseUrl}}/admin/queries/capacity',
                  host: ['{{baseUrl}}'],
                  path: ['admin', 'queries', 'capacity']
                }
              }
            },
            {
              name: 'Get Resolver Workload Dashboard',
              request: {
                method: 'GET',
                header: [
                  { key: 'Authorization', value: 'Bearer {{adminToken}}' }
                ],
                url: {
                  raw: '{{baseUrl}}/admin/queries/workload',
                  host: ['{{baseUrl}}'],
                  path: ['admin', 'queries', 'workload']
                }
              }
            }
          ]
        }
      ]
    };

    const outPath = path.join(__dirname, '../../postman_test_data.json');
    const colPath = path.join(__dirname, '../../postman_collection.json');
    fs.writeFileSync(outPath, JSON.stringify(postmanCollection, null, 2));
    fs.writeFileSync(colPath, JSON.stringify(postmanCollection, null, 2));

    console.log('\n========================================================================');
    console.log('✅ POSTMAN SEEDING SUCCESSFUL!');
    console.log('========================================================================\n');
    console.log('📦 Data exported to: D:\\Phase 1 from G-group\\csfaq\\apps\\query-triage\\postman_test_data.json');
    console.log('\n--- 🔑 STUDENT TOKEN (Alice Student) ---');
    console.log(`Bearer ${studentToken}\n`);
    console.log('--- 🛡️ ADMIN TOKEN (Triage Lead Admin) ---');
    console.log(`Bearer ${adminToken}\n`);
    console.log('--- 🛠️ RESOLVER TOKEN (Charlie Support Resolver) ---');
    console.log(`Bearer ${resolverToken}\n`);
    console.log('--- 📋 SAMPLE CASE IDS ---');
    console.log(`P0 Awaiting Human:  ${caseP0._id}`);
    console.log(`P1 Awaiting Human:  ${caseP1._id}`);
    console.log(`P2 Assigned Case:   ${caseP2._id}`);
    console.log(`P3 AI Answered:     ${caseP3._id}`);
    console.log(`Parent Incident:    ${caseParent._id}`);
    console.log('========================================================================\n');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

seedPostmanData();
