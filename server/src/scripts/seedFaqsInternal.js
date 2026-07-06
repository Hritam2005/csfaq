import Category from '../models/Category.js';
import FAQ from '../models/FAQ.js';
import User from '../models/User.js';
import Role from '../models/Role.js';
import { logger } from '../config/logger.js';

const categoriesData = [
  { name: 'About the internship', description: 'General information, phases, and eligibility for the Vicharanashala internship.', order: 1, color: '#3B82F6', icon: 'info' },
  { name: 'Timing and dates', description: 'Internship start/end dates, commitment rules, and exam policies.', order: 2, color: '#10B981', icon: 'calendar' },
  { name: 'NOC (No Objection Certificate)', description: 'NOC format, signatures, and dashboard upload instructions.', order: 3, color: '#F59E0B', icon: 'file-text' },
  { name: 'Selection, offer letter, and certificate', description: 'Offer letter acceptance steps, validation, and certificate rules.', order: 4, color: '#8B5CF6', icon: 'mail' },
  { name: 'Work, mentorship, and projects', description: 'Mentoring model, project domains, and laptop/software requirements.', order: 5, color: '#EC4899', icon: 'briefcase' },
  { name: 'Code of conduct — communication channels', description: 'Official Slack/Zoom channels, rules against unofficial groups.', order: 6, color: '#EF4444', icon: 'message-square' },
  { name: 'Interviews Related', description: 'Interview troubleshooting and marking status complete.', order: 7, color: '#06B6D4', icon: 'users' },
  { name: 'Certificate', description: 'Verification, grading, and distribution details for completion certificates.', order: 8, color: '#F59E0B', icon: 'award' },
  { name: 'Rosetta — your internship journal', description: 'Daily writing routines, AI rules, and final submission.', order: 9, color: '#14B8A6', icon: 'book-open' },
  { name: 'Phase 1 — coursework, Vibe LMS, and live sessions', description: 'Coursework exceptions, Zoom links, and rolling attendance rules.', order: 10, color: '#6366F1', icon: 'video' },
  { name: 'Spurti Points', description: 'How Spurti Points (SP) are calculated, and policy on SP deductions.', order: 11, color: '#EAB308', icon: 'zap' },
  { name: 'Yaksha Chat Related', description: 'Troubleshooting chat interface and interacting with Yaksha.', order: 12, color: '#3B82F6', icon: 'message-circle' },
  { name: 'ViBe Platform', description: 'Third-party cookies, DNS issues, video player troubleshooting, and access restrictions.', order: 13, color: '#8B5CF6', icon: 'play' },
  { name: 'Team Formation', description: 'Team sizing, random allocation, rules on inter-college teammates, and team tasks.', order: 14, color: '#10B981', icon: 'users' }
];

const faqsData = [
  // Category 1: About the internship
  {
    categoryName: 'About the internship',
    question: 'What is the Vicharanashala internship?',
    answer: 'A two-month, full-time engagement at the Vicharanashala Lab, a research lab at IIT Ropar. You will work on a real open-source project under a mentor, after a short training phase tailored to where you already are. The internship is free — we do not charge, and the work is real.',
    difficultyLevel: 'Beginner',
    estimatedReadingTime: 1
  },
  {
    categoryName: 'About the internship',
    question: 'What is VINS?',
    answer: 'VINS is the Vicharanashala Internship — an online programme open to anyone who clears our interview. The work is real open-source contribution under a mentor, the certificate is from the Vicharanashala Lab for Education Design at IIT Ropar, and the programme itself is free (we charge nothing). There is no stipend.\n\nIf you are seeing a yellow VINS panel on your result page, you are selected.',
    difficultyLevel: 'Beginner',
    estimatedReadingTime: 1
  },
  {
    categoryName: 'About the internship',
    question: 'What are the phases of VINS, and what do the badges mean?',
    answer: 'VINS is structured as four phases. Each one is marked by a badge — a small token of where you are in the journey:\n\n*   **Bronze (Phase 1) — a short training period** at the start, planned around what you already know. If you arrive already comfortable with the basics, your mentor may skip Bronze and put you straight on to the project.\n*   **Silver (Phase 2) — the main work.** You contribute to a real open-source project under a Vicharanashala mentor. Finishing Bronze and Silver completes your internship and earns the certificate.\n*   **Gold (Phase 3) — a recognition** awarded during Silver if your contribution stands on its own as a meaningful feature, not just a small fix.\n*   **Platinum (Phase 4) — a standing invitation** to come back and visit the lab — a short trip — any time during the year after your internship ends. We help with travel through a small visit stipend.\n\nMost interns finish at Bronze + Silver, and that is exactly what the certificate is for. Gold and Platinum are extras you can pick up if your work makes the case for them. Either way, you walk away with a real open-source contribution to your name and a mentor who knows you well.',
    difficultyLevel: 'Intermediate',
    estimatedReadingTime: 2
  },
  {
    categoryName: 'About the internship',
    question: 'Who is the internship for? Are alumni eligible?',
    answer: 'The internship is for currently-enrolled students at any college or university — undergraduate, postgraduate, or doctoral. The NOC requirement is the practical reflection of this: we ask for institutional consent that you can commit your time to this internship.\n\nCandidates who have already graduated and are not currently enrolled in any programme are not eligible for this cycle. If you re-enrol later (higher studies, etc.), you are very welcome to apply again in a future cycle.',
    difficultyLevel: 'Beginner',
    estimatedReadingTime: 1
  },
  {
    categoryName: 'About the internship',
    question: 'Is this the same as IIT Ropar\'s official Summer Research Internship?',
    answer: 'No. Summership 2026 is a VLED Lab initiative. The certificate is issued by the Vicharanashala Lab for Education Design, not centrally by the institute. IIT Ropar runs a separate institutional summer research internship through its own office. Do not represent Summership 2026 as equivalent to that programme.',
    difficultyLevel: 'Beginner',
    estimatedReadingTime: 1
  },
  {
    categoryName: 'About the internship',
    question: 'I have to attend my class tomorrow/today/some day — can I take leave?',
    answer: 'Leave is not permitted. If you are also attending classes or exams, you will be relieved from the internship immediately and will need to join the next batch when it starts.',
    difficultyLevel: 'Beginner',
    estimatedReadingTime: 1
  },

  // Category 2: Timing and dates
  {
    categoryName: 'Timing and dates',
    question: 'When can I start?',
    answer: 'You can start any time in 2026 — VINS is flexible on the start date — but there are two things you must hold in mind together, and one strong recommendation:\n\n*   **The hard rule:** Your internship must finish by **31 December 2026**. That date is non-negotiable. Whatever start you pick, your end date (your start + 2 months, with up to 1 month grace) must land on or before 31 December 2026. So while there is no last date to opt in, there is absolutely a last date to finish.\n*   **The strong recommendation:** **Start as soon as possible.** The earlier you join, the more of the May–July main cohort you catch — and three things make starting earlier materially better than starting later:\n    1.  *Cohort networking:* The batch goes through Bronze together — peer discussions, parallel problem-solving, and lasting connections happen during this window. Later in the year the cohort disperses and late starters are largely solo.\n    2.  *TA support:* TA support is concentrated in May–July. TAs are full-time during this window. After this they return to their own college work and bandwidth is materially thinner.\n    3.  *Training rolls out with the cohort:* Training rolls out with the cohort, not piecemeal — you get the material with the discussion around it, not as a static document.\n\nIf starting now is genuinely impossible for you (exams, other unavoidable commitments), you can begin later and still complete and earn the certificate — but be honest with yourself: the cohort effect and support will be lighter, and the December cap means a late start leaves no room for slippage.',
    difficultyLevel: 'Intermediate',
    estimatedReadingTime: 3
  },
  {
    categoryName: 'Timing and dates',
    question: 'How long is the internship?',
    answer: 'Two months from your chosen start date, with an optional one-month grace period if you need it. End must land on or before 31 December 2026.',
    difficultyLevel: 'Beginner',
    estimatedReadingTime: 1
  },
  {
    categoryName: 'Timing and dates',
    question: 'Can I start in July, August or later if I have exams now?',
    answer: 'Yes — but only if your exams genuinely make an earlier start impossible. Wait until your exams are done, then opt in and start. Do not attempt to juggle this internship with ongoing exams. Make sure your chosen start date plus 2 months (or 3 with grace) lands on or before 31 December 2026.',
    difficultyLevel: 'Beginner',
    estimatedReadingTime: 1
  },
  {
    categoryName: 'Timing and dates',
    question: 'Can I start with the cohort and take a relaxation during my exam window?',
    answer: 'No. This is not an arrangement we offer.\n\nVINS is a full-attention internship — six to ten hours a day, sometimes more. Splitting that with college exams damages both sides: the project loses momentum, the exams suffer, and the mentor invests in someone who can only half-engage. We have seen this fail enough times to be firm.\n\nIf your exams fall inside the cohort duration, defer your start to after your exams end, opt in then, and run the internship at full attention. The certificate and project pathway are the same.\n\n**A note on consequences:** If we later learn that a candidate was sitting college exams during their internship period, we reserve the right to terminate the internship or withhold the certificate at any time — including after the internship has otherwise been completed.',
    difficultyLevel: 'Advanced',
    estimatedReadingTime: 2
  },
  {
    categoryName: 'Timing and dates',
    question: 'Can I take leave or get an exemption during the internship for an exam scheduled in June?',
    answer: 'The attendance rule is firm — the 55-day continuous window is a non-negotiable part of the internship, and we cannot offer an exemption for an exam during this period. The policy exists because split attention genuinely damages both your exam preparation and your internship work.',
    difficultyLevel: 'Intermediate',
    estimatedReadingTime: 1
  },

  // Category 3: NOC
  {
    categoryName: 'NOC (No Objection Certificate)',
    question: 'What dates do I put on the NOC?',
    answer: 'Default: **your chosen start date → your start + 2 months** (with up to 1 month grace), ensuring the end date is on or before 31 December 2026. Pick the earliest start date you can realistically make — the May–July summer window is the main cohort.\n\nIf the NOC will be signed on a specific later date, pick a start date after the signature date.',
    difficultyLevel: 'Intermediate',
    estimatedReadingTime: 1
  },
  {
    categoryName: 'NOC (No Objection Certificate)',
    question: 'Who can sign the NOC?',
    answer: 'Any authorised signatory at your college: HOD, Acting HOD (during holidays), Principal, Dean, Director, or Training & Placement Officer. For dual-degree students, either institution can sign — pick whichever is easier. For IITM BS Online Degree (standalone) students, any officer from the BS office can sign.',
    difficultyLevel: 'Beginner',
    estimatedReadingTime: 1
  },
  {
    categoryName: 'NOC (No Objection Certificate)',
    question: 'Does it need to be signed by hand?',
    answer: 'Yes. Three things are required, all on the NOC format we provide:\n\n1.  The authorised signatory\'s **handwritten signature**\n2.  The **institutional rubber stamp / seal** applied in the designated area\n3.  The signatory\'s **email address** filled in the designated field — we automatically cross-check with that person to verify the signature is genuine\n\n**Digital signatures are not accepted.** The only path is a physically-signed printout uploaded by you from the dashboard.',
    difficultyLevel: 'Intermediate',
    estimatedReadingTime: 2
  },

  // Category 4: Selection, offer letter, and certificate
  {
    categoryName: 'Selection, offer letter, and certificate',
    question: 'How do I know I am selected?',
    answer: 'If you can see your yellow VINS result panel on samagama.in, you are selected. There is no separate selection step or confirmation email.',
    difficultyLevel: 'Beginner',
    estimatedReadingTime: 1
  },
  {
    categoryName: 'Selection, offer letter, and certificate',
    question: 'How do I accept the offer letter?',
    answer: 'Acceptance happens entirely on your dashboard at samagama.in — there is no email reply, and nothing to paste or post. The Offer Letter card guides you through three steps, and your offer is recorded as accepted only once all three are complete. Please finish them within 5 days of your offer being issued:\n\n1.  **Offer letter** — download your offer letter, sign the *Acceptance of Offer* block at the bottom of it, and upload the signed PDF on the card.\n2.  **Terms & Conditions (Participation Agreement)** — read each section and tick the box to confirm you have understood it.\n3.  **Honor Code** — download the Honor Code, sign the last page, and upload the signed PDF.\n\nEach PDF upload is capped at 1 MB; to correct a file, just upload a new copy — the latest replaces the previous one. The card updates as you complete each step and shows your offer as accepted once all three are done.',
    difficultyLevel: 'Advanced',
    estimatedReadingTime: 2
  },

  // Category 5: Work, mentorship, and projects
  {
    categoryName: 'Work, mentorship, and projects',
    question: 'What will I work on?',
    answer: 'A real open-source project from Vicharanashala\'s portfolio — assigned based on your background and the lab\'s current needs. Areas range across AI/ML, web development, NLP, computer vision, agriculture-tech (Annam.AI), education-tech (ViBe), and open-source infrastructure. We do not pre-publish the exact problem; you choose to join knowing the lab will assign the project.',
    difficultyLevel: 'Intermediate',
    estimatedReadingTime: 1
  },
  {
    categoryName: 'Work, mentorship, and projects',
    question: 'Who is my mentor?',
    answer: 'You will work with the lab\'s research and engineering team. The exact mentor depends on the project. The model is fluid — you will get help from a senior researcher one day, a peer the next, and someone else for a different question. That is how real open-source work happens.',
    difficultyLevel: 'Intermediate',
    estimatedReadingTime: 1
  },

  // Category 6: Code of conduct — communication channels
  {
    categoryName: 'Code of conduct — communication channels',
    question: 'What are the official communication channels?',
    answer: 'Official channels only. The Announcements section on samagama.in is how we notify you — all programme notifications are posted there (we no longer send notifications by email). Log in and check it regularly during working hours; sessions are announced at least 1 hour before they begin.\n\nTo get help with a question or problem, follow this order:\n\n1.  **Zoom breakout room.** During every live session there is a breakout room — use it. Talk to your peers. Most questions are resolved here.\n2.  **Discussion forum.** For anything not resolved in the breakout, post on the discussion forum. The link was sent to you in your sign-up (registration) email when you first created your account on samagama.in, and is also posted in the Announcements section.\n3.  **Yaksha chat on samagama.in .** If the forum did not resolve it, bring it to Yaksha. Explain what you tried at each prior step — without that, Yaksha cannot help you well.\n\n**WhatsApp support is cancelled.** There is no WhatsApp troubleshooting group. **Unofficial groups are strictly prohibited.** Creating, joining, or operating any WhatsApp group, Telegram channel, Discord server, or any other peer-coordinated space involving interns — or contacting another intern through their personal phone number — is against the code of conduct. Any complaint or report of this will lead to the **immediate termination** of your internship.',
    difficultyLevel: 'Advanced',
    estimatedReadingTime: 3
  },

  // Category 7: Interviews Related
  {
    categoryName: 'Interviews Related',
    question: 'My interview is not marked as complete on the dashboard — what do I do?',
    answer: 'A data-sync issue sometimes occurs where the chat session closes but the interview record doesn\'t update to \"completed.\" The team will check your record and manually mark it as complete if needed. You will be unblocked within 1–2 hours. Apologies for the inconvenience. If you dont hear from us and if your interview continues to be marked incomplete please write to us on internship@vicharanashala.ai',
    difficultyLevel: 'Beginner',
    estimatedReadingTime: 1
  },

  // Category 8: Certificate
  {
    categoryName: 'Certificate',
    question: 'Does the Vicharanashala internship certificate specify whether it was completed online or offline?',
    answer: 'The certificate you receive on completing the internship is the same for both tracks. It is issued by Vicharanashala, IIT Ropar, and does not specify whether you completed it online or on campus. The certificate records only that you completed the internship; the mode is not called out separately on the document.',
    difficultyLevel: 'Beginner',
    estimatedReadingTime: 1
  },

  // Category 9: Rosetta
  {
    categoryName: 'Rosetta — your internship journal',
    question: 'What is Rosetta?',
    answer: 'Rosetta is your internship journal — a 65-day document, one entry per day, every day, for the full duration of Summership 2026. You write in it daily, keep it privately, and submit it at the end of the internship as one of your completion requirements.\n\nThe name comes from the Rosetta Stone — discovered in 1799, it carried the same text in three scripts and became the key to decoding an ancient language that had been silent for centuries. Not because it was grand, but because it was honest and consistent. That is what this journal is meant to be for you. Sixty-five days of honest writing will become the key to understanding your own experience — what you learned, where you struggled, what shifted in you.',
    difficultyLevel: 'Intermediate',
    estimatedReadingTime: 2
  },
  {
    categoryName: 'Rosetta — your internship journal',
    question: 'Can I use ChatGPT or any AI tool to write my entries?',
    answer: 'No. This is the one firm rule of Rosetta.\n\nThe journal is a record of your thinking, not a demonstration of what an AI can produce on your behalf. Entries that read as AI-generated will not be counted toward your completion requirement. If your entire journal reads this way, the journal will not be accepted.\n\nUse AI tools for your technical work if that is permitted in the programme. Do not use them here.',
    difficultyLevel: 'Intermediate',
    estimatedReadingTime: 1
  },

  // Category 10: Phase 1
  {
    categoryName: 'Phase 1 — coursework, Vibe LMS, and live sessions',
    question: 'What are the attendance and participation rules?',
    answer: 'Attendance and participation are tracked strictly, and all of the following are measured continuously over a rolling window of the last 5 working days:\n\n*   **Live-session attendance** — at least **85%**. You must be present for at least 85% of the total Zoom meeting time.\n*   **Live participation** — at least **85%**. You must respond to the in-session polls and quizzes at least 85% of the times they are run.\n*   **Quizzes** — attempted, and passed. Every quiz must be attempted, and your pass percentage must be at least 50%.\n\nBecause this is a rolling 5-working-day measure, it reflects your recent engagement, not a one-time average. If any one of these three falls below its threshold, you will be excused from the current batch and moved to the next batch. This is not a penalty — it simply means you rejoin in a later batch where you can give the programme the full attention it needs.',
    difficultyLevel: 'Advanced',
    estimatedReadingTime: 2
  },

  // Category 11: Spurti Points
  {
    categoryName: 'Spurti Points',
    question: 'What are Spurti Points?',
    answer: 'Spurti Points, or SP, are a points layer on the platform that reflects your overall engagement with the programme.\n\nThink of SP as an indicator of your engagement — nothing more. It is not a score that defines you as a student or determines your future in the programme. Every intern starts with a base of 100 SP credited on their official start date. SP is then earned through attendance and poll participation.',
    difficultyLevel: 'Intermediate',
    estimatedReadingTime: 1
  },

  // Category 12: Yaksha Chat
  {
    categoryName: 'Yaksha Chat Related',
    question: 'I\'m unable to type in the chat after clicking \'Interact with Yaksha\' — what should I do?',
    answer: 'This is usually caused by network connection drop or caching issues. First try refreshing your page completely. If that does not work, try logging out and logging back in, or check if you are behind an institutional firewall that blocks websocket connections. As a fallback, ensure your browser allows third-party scripts from samagama.in.',
    difficultyLevel: 'Beginner',
    estimatedReadingTime: 1
  },

  // Category 13: ViBe Platform
  {
    categoryName: 'ViBe Platform',
    question: 'I am seeing a red "Access Restricted" banner. Is this a bug?',
    answer: 'No, this is not a bug. The red Access Restricted banner is an intentional alert from the platform.\n\nIt appears when you try to open an item (video or quiz) before completing all the items that come before it. If you are on the nth item but haven\'t completed every video and quiz from item 1 through item n-1, the platform will show this alert.\n\nWhen the banner appears, ViBe automatically returns you to the previous valid content — that is, the last item you had legitimately reached in the sequence. You will not lose any progress; you\'ll simply be sent back to where you actually are in the course.',
    difficultyLevel: 'Intermediate',
    estimatedReadingTime: 2
  },
  {
    categoryName: 'ViBe Platform',
    question: 'Why are videos stuck or repeating?',
    answer: 'This may happen due to ViBe\'s monitored learning system. Common reasons include:\n\n*   Videos must be watched fully and in sequence (no skipping).\n*   Camera and microphone permissions must be enabled.\n*   Poor lighting or high background noise can affect playback.\n*   Switching tabs or staying idle may restart the video.\n\n✅ For smooth playback, stay on the ViBe tab, keep your camera on, and watch videos in a quiet, well-lit environment.',
    difficultyLevel: 'Intermediate',
    estimatedReadingTime: 1
  },

  // Category 14: Team Formation
  {
    categoryName: 'Team Formation',
    question: 'Is team formation compulsory?',
    answer: 'Yes. All projects in Phase 2 and Phase 3 (some parts) must be completed in teams. Every participant is required to be part of a team.',
    difficultyLevel: 'Beginner',
    estimatedReadingTime: 1
  },
  {
    categoryName: 'Team Formation',
    question: 'What is the size of a team?',
    answer: 'The team size is fixed at four members. This is mandatory — you cannot have fewer or more members in a team at the time of final formation.',
    difficultyLevel: 'Beginner',
    estimatedReadingTime: 1
  },
  {
    categoryName: 'Team Formation',
    question: 'Can I form a team with someone from my own college?',
    answer: 'No. Teams must consist of members from different institutions to encourage networking. Exception: Students from the same institution but different campuses/locations may be allowed.',
    difficultyLevel: 'Intermediate',
    estimatedReadingTime: 1
  }
];

export const seedFaqsInternal = async () => {
  try {
    let adminRole = await Role.findOne({ name: 'System Administrator' });
    if (!adminRole) {
      adminRole = await Role.create({
        name: 'System Administrator',
        description: 'Full system access',
        isSystem: true,
        isActive: true,
      });
    }

    const email = 'admin@example.com';
    let adminUser = await User.findOne({ email });
    if (!adminUser) {
      adminUser = await User.create({
        fullName: 'System Admin',
        username: 'admin',
        email,
        password: 'AdminPassword123!',
        role: adminRole._id,
        accountStatus: 'active',
      });
      logger.info('✅ Auto-created seed Admin user.');
    }

    // Ensure "Registered User" role exists
    let userRole = await Role.findOne({ name: 'Registered User' });
    if (!userRole) {
      userRole = await Role.create({
        name: 'Registered User',
        description: 'Default role for registered users',
        isSystem: true,
        isActive: true,
      });
      logger.info('✅ Seeded role: Registered User');
    }

    // Seed normal user: nababratobiswas11c@gmail.com
    const normalUserEmail = 'nababratobiswas11c@gmail.com';
    let normalUser = await User.findOne({ email: normalUserEmail });
    if (!normalUser) {
      normalUser = await User.create({
        fullName: 'Nababrato Biswas',
        username: 'nababrato',
        email: normalUserEmail,
        password: 'Jatindra_2003',
        role: userRole._id,
        accountStatus: 'active',
      });
      logger.info('✅ Auto-created seed Normal user.');
    } else {
      normalUser.password = 'Jatindra_2003';
      normalUser.accountStatus = 'active';
      await normalUser.save();
      logger.info('✅ Updated seed Normal user password.');
    }

    // Clear existing FAQs and Categories to avoid duplicates and ensure clean state
    await FAQ.deleteMany({});
    await Category.deleteMany({});
    logger.info('Cleared existing FAQs and Categories in DB.');

    // Save categories and store mapping of name -> ID
    const categoryMap = {};
    for (const catData of categoriesData) {
      const slug = catData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      const category = await Category.create({
        ...catData,
        slug
      });
      categoryMap[catData.name] = category._id;
      logger.info(`Seeded category: ${category.name}`);
    }

    // Insert FAQs linked to categories
    for (const faqData of faqsData) {
      const categoryId = categoryMap[faqData.categoryName];
      if (!categoryId) {
        logger.warn(`Category not found for FAQ: ${faqData.question}`);
        continue;
      }

      await FAQ.create({
        question: faqData.question,
        answer: faqData.answer,
        category: categoryId,
        difficultyLevel: faqData.difficultyLevel.toLowerCase(),
        estimatedReadingTime: faqData.estimatedReadingTime,
        approvalStatus: 'approved',
        visibility: 'public',
        createdBy: adminUser._id
      });
      logger.info(`Seeded FAQ: ${faqData.question}`);
    }

    // Update Category document counts
    for (const catName of Object.keys(categoryMap)) {
      const catId = categoryMap[catName];
      const count = await FAQ.countDocuments({ category: catId, isDeleted: false });
      await Category.findByIdAndUpdate(catId, {
        'analytics.faqCount': count,
        'analytics.documentCount': count
      });
    }

    logger.info('🎉 Database successfully seeded with FAQ questions and categories!');
  } catch (error) {
    logger.error('Error during FAQ seeding:', error);
  }
};
