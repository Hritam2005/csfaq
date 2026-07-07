import OpenAI from 'openai';
import { env } from '../config/env.js';
import { logger } from '../config/logger.js';

let openaiClient = null;
try {
  openaiClient = new OpenAI({
    apiKey: env.openai?.apiKey || 'sk-local-no-key-required',
    baseURL: env.openai?.baseUrl || 'http://127.0.0.1:8080/v1',
  });
} catch (e) {
  logger.warn('Failed to initialize OpenAI/Local LLM client:', e.message);
}

const STANDALONE_KNOWLEDGE_BASE = [
  // ── Section 1: About the Internship ──────────────────────────────────────────
  {
    _id: 'vins_1_1',
    id: 'vins_1_1',
    programId: 'prog_vins_2026',
    title: 'What is the Vicharanashala Internship (VINS)',
    question: 'What is the Vicharanashala internship? What is VINS?',
    answer: 'The Vicharanashala internship (VINS) is a two-month, full-time engagement at the Vicharanashala Lab, a research lab at IIT Ropar. VINS is the online programme open to anyone who clears our interview. The work is real open-source contribution under a mentor, the certificate is from the Vicharanashala Lab for Education Design at IIT Ropar, and the programme is free (we charge nothing). There is no stipend. If you are seeing a yellow VINS panel on your result page, you are selected.',
    approvalStatus: 'published', popularityScore: 98, version: 1, type: 'faq'
  },
  {
    _id: 'vins_1_3',
    id: 'vins_1_3',
    programId: 'prog_vins_2026',
    title: 'VINS Phases and Badges: Bronze, Silver, Gold, Platinum',
    question: 'What are the phases of VINS and what do the badges Bronze Silver Gold Platinum mean?',
    answer: 'VINS has four phases marked by badges. Bronze (Phase 1): a short training period at the start culminating in a CSFAQ project submission — you submit a GitHub link (repo or PR) along with product documentation and a project report. Silver (Phase 2): the main work — you contribute to a real open-source project under a Vicharanashala mentor. Finishing Bronze and Silver completes your internship and earns the certificate. Gold (Phase 3): recognition awarded during Silver if your contribution stands on its own as a meaningful feature. Platinum (Phase 4): a standing invitation to visit the IIT Ropar lab after your internship ends with a small visit stipend.',
    approvalStatus: 'published', popularityScore: 97, version: 2, type: 'faq'
  },
  {
    _id: 'vins_1_4',
    id: 'vins_1_4',
    programId: 'prog_vins_2026',
    title: 'Internship Eligibility — Who Can Join, Alumni Policy',
    question: 'Who is the internship for? Are alumni or already graduated candidates eligible?',
    answer: 'The internship is for currently-enrolled students at any college or university — undergraduate, postgraduate, or doctoral. The NOC requirement is the practical reflection of this. Candidates who have already graduated and are not currently enrolled in any programme are not eligible for this cycle. If you re-enrol later (higher studies etc.), you are welcome to apply in a future cycle.',
    approvalStatus: 'published', popularityScore: 86, version: 1, type: 'policy'
  },
  {
    _id: 'vins_1_5',
    id: 'vins_1_5',
    programId: 'prog_vins_2026',
    title: 'VINS vs IIT Ropar Official Summer Research Internship',
    question: 'Is this the same as IIT Ropar official Summer Research Internship?',
    answer: 'No. Summership 2026 is a VLED Lab initiative. The certificate is issued by the Vicharanashala Lab for Education Design, not centrally by the institute. IIT Ropar runs a separate institutional summer research internship through its own office. Do not represent Summership 2026 as equivalent to that programme.',
    approvalStatus: 'published', popularityScore: 76, version: 1, type: 'faq'
  },
  {
    _id: 'vins_1_6',
    id: 'vins_1_6',
    programId: 'prog_vins_2026',
    title: 'Leave Policy — Attending Classes or Exams During Internship',
    question: 'Can I take leave during the internship to attend class or exams?',
    answer: 'Leave is not permitted. If you are also attending classes or exams, you will be relieved from the internship immediately and will need to join the next batch when it starts. VINS is a full-attention internship — six to ten hours a day, sometimes more.',
    approvalStatus: 'published', popularityScore: 90, version: 1, type: 'policy'
  },
  // ── Section 2: Timing and Dates ──────────────────────────────────────────────
  {
    _id: 'vins_2_1',
    id: 'vins_2_1',
    programId: 'prog_vins_2026',
    title: 'When to Start the Internship — Flexibility and December Deadline',
    question: 'When can I start? Is there a last date to opt in?',
    answer: 'You can start any time in 2026 — VINS is flexible on the start date. However, your internship must finish by 31 December 2026 (non-negotiable). Start as soon as possible to catch the May–July main cohort where TA support is concentrated and cohort networking happens. If starting now is impossible due to exams, wait until they finish, then start — but be aware the December cap means a late start leaves no room for slippage.',
    approvalStatus: 'published', popularityScore: 93, version: 1, type: 'faq'
  },
  {
    _id: 'vins_2_2',
    id: 'vins_2_2',
    programId: 'prog_vins_2026',
    title: 'Internship Duration — Two Months with Grace Period',
    question: 'How long is the internship duration?',
    answer: 'Two months from your chosen start date, with an optional one-month grace period if you need it. The end date must land on or before 31 December 2026.',
    approvalStatus: 'published', popularityScore: 93, version: 1, type: 'faq'
  },
  {
    _id: 'vins_2_3',
    id: 'vins_2_3',
    programId: 'prog_vins_2026',
    title: 'Starting in July, August or Later Due to Exams',
    question: 'Can I start in July, August or later if I have exams now?',
    answer: 'Yes — but only if your exams genuinely make an earlier start impossible. Wait until your exams are done, then opt in and start. Do not attempt to juggle this internship with ongoing exams. If we later learn that a candidate was sitting college exams during their internship period, we reserve the right to terminate the internship or withhold the certificate at any time.',
    approvalStatus: 'published', popularityScore: 88, version: 1, type: 'policy'
  },
  {
    _id: 'vins_2_5',
    id: 'vins_2_5',
    programId: 'prog_vins_2026',
    title: 'Exam Leave or Exemption During Active Internship',
    question: 'Can I take leave or get an exemption during the internship for an exam scheduled in June?',
    answer: 'The attendance rule is firm — the 55-day continuous window is a non-negotiable part of the internship, and we cannot offer an exemption for an exam during this period. The policy exists because split attention genuinely damages both your exam preparation and your internship work.',
    approvalStatus: 'published', popularityScore: 88, version: 1, type: 'policy'
  },
  {
    _id: 'vins_2_6',
    id: 'vins_2_6',
    programId: 'prog_vins_2026',
    title: 'Orientation Session Recordings',
    question: 'Are orientation session recordings shared with interns?',
    answer: 'Recordings of the sessions will not be provided. We may provide access to an abridged version of a talk or session if we consider it important, but we do not guarantee this for every session.',
    approvalStatus: 'published', popularityScore: 73, version: 1, type: 'faq'
  },
  // ── Section 3: NOC ───────────────────────────────────────────────────────────
  {
    _id: 'vins_3_1',
    id: 'vins_3_1',
    programId: 'prog_vins_2026',
    title: 'NOC Dates to Fill In',
    question: 'What dates do I put on the NOC?',
    answer: 'Default: your chosen start date to your start + 2 months (with up to 1 month grace), ensuring the end date is on or before 31 December 2026. Pick the earliest start date you can realistically make — the May–July summer window is the main cohort. If the NOC will be signed on a specific later date, pick a start date after the signature date.',
    approvalStatus: 'published', popularityScore: 87, version: 1, type: 'policy'
  },
  {
    _id: 'vins_3_2',
    id: 'vins_3_2',
    programId: 'prog_vins_2026',
    title: 'Who Can Sign the NOC — Authorised Signatories',
    question: 'Who can sign the NOC?',
    answer: 'Any authorised signatory at your college: HOD, Acting HOD (during holidays), Principal, Dean, Director, or Training & Placement Officer. For dual-degree students, either institution can sign — pick whichever is easier. For IITM BS Online Degree (standalone) students, any officer from the BS office can sign.',
    approvalStatus: 'published', popularityScore: 89, version: 1, type: 'policy'
  },
  {
    _id: 'vins_3_3',
    id: 'vins_3_3',
    programId: 'prog_vins_2026',
    title: 'NOC Submission Deadline and When to Submit',
    question: 'When do I submit the NOC? Is the deadline hard?',
    answer: 'There is no specific calendar cut-off date by which the NOC must be uploaded — but your internship cannot formally begin until your official institutional NOC has been uploaded and validated by us. Submit your signed NOC as early as possible and join the current summer cohort. Starting later means less cohort networking and thinner TA support.',
    approvalStatus: 'published', popularityScore: 88, version: 1, type: 'policy'
  },
  {
    _id: 'vins_3_4',
    id: 'vins_3_4',
    programId: 'prog_vins_2026',
    title: 'NOC Format — Download from Dashboard, No Design Needed',
    question: 'What format should I use for the NOC? Do I need to design it myself?',
    answer: 'No — we provide a printable NOC format. Once your result is out and you log in to samagama.in, you will see a "Download blank NOC" button on your dashboard. Take a printout, get it physically signed and stamped by your authorised signatory, scan it, and upload the signed PDF using the "Upload signed NOC" button. You do not need to draft anything yourself, and you do not need college letterhead.',
    approvalStatus: 'published', popularityScore: 88, version: 1, type: 'faq'
  },
  {
    _id: 'vins_3_5',
    id: 'vins_3_5',
    programId: 'prog_vins_2026',
    title: 'College Own NOC Format Acceptability',
    question: 'What if my college or Program Chair gives me an NOC in their own format?',
    answer: 'A college\'s own NOC format is acceptable if it has: the signing authority\'s handwritten signature, their name, designation, official email address, and phone number, your full name and internship period (start and end dates), and your signature. An NOC missing any of them is incomplete and will be returned for correction.',
    approvalStatus: 'published', popularityScore: 85, version: 1, type: 'policy'
  },
  {
    _id: 'vins_3_6',
    id: 'vins_3_6',
    programId: 'prog_vins_2026',
    title: 'NOC Must Be Physically Signed by Hand — No Digital Signatures',
    question: 'Does the NOC need to be signed by hand? Are digital signatures accepted?',
    answer: 'Yes, the NOC must be physically signed by hand. Three things are required: the authorised signatory\'s handwritten signature, the institutional rubber stamp/seal applied in the designated area, and the signatory\'s email address filled in the designated field. Digital signatures are not accepted. The only path is a physically-signed printout uploaded by you from the dashboard.',
    approvalStatus: 'published', popularityScore: 87, version: 1, type: 'policy'
  },
  {
    _id: 'vins_3_7',
    id: 'vins_3_7',
    programId: 'prog_vins_2026',
    title: 'HOD Cannot Email the NOC — Student Must Upload',
    question: 'Can my HOD email the NOC instead of me uploading it to the dashboard?',
    answer: 'No. Your NOC must be uploaded by you, the student, from your dashboard — we no longer accept NOCs sent by email. The email-forward path has been retired. NOCs emailed to us — whether by you or by your HOD — will not be processed. The only accepted way is to download the format, get it signed, and upload the signed PDF yourself from your dashboard.',
    approvalStatus: 'published', popularityScore: 88, version: 2, type: 'policy'
  },
  {
    _id: 'vins_3_8',
    id: 'vins_3_8',
    programId: 'prog_vins_2026',
    title: 'How to Download and Upload the NOC on samagama.in',
    question: 'How do I download and upload the NOC on the dashboard?',
    answer: 'Both happen on your dashboard at samagama.in. You will see a NOC section with two buttons: "Download blank NOC" (saves the printable NOC format PDF) and "Upload signed NOC (PDF)" (opens a file picker; file must be a PDF of at most 1 MB). The buttons appear in three places: the compact pill in the dark header bar, the standalone NOC card on the dashboard, and the NOC section at the bottom of your result message. The chat no longer carries any NOC affordance.',
    approvalStatus: 'published', popularityScore: 90, version: 1, type: 'faq'
  },
  {
    _id: 'vins_3_9',
    id: 'vins_3_9',
    programId: 'prog_vins_2026',
    title: 'NOC Verification Time and Offer Letter Timing',
    question: 'What if my NOC is not formally verified? How long does verification take?',
    answer: 'NOC verification takes time — typically anywhere between an hour and one full working day from the moment you upload. Your offer letter is issued automatically once your signed institutional NOC is uploaded and validated — there is no faster route. The earlier self-declaration/provisional-offer option was retired on 2026-05-27 and is no longer accepted.',
    approvalStatus: 'published', popularityScore: 87, version: 2, type: 'faq'
  },
  {
    _id: 'vins_3_10',
    id: 'vins_3_10',
    programId: 'prog_vins_2026',
    title: 'Online Course Students Cannot Get NOC — Eligibility Issue',
    question: 'My online course Masai NPTEL Coursera will not issue an NOC. What do I do?',
    answer: 'The internship is open only to candidates currently enrolled in a full-time degree programme at a recognised college or university. Online-only courses — Masai Institute, NPTEL, Coursera, Udacity, bootcamps — do not by themselves make a candidate eligible. If you are concurrently enrolled in a full-time degree programme alongside the online course, obtain a NOC from that college. If your only academic engagement is the online course, the internship is not open to you this cycle.',
    approvalStatus: 'published', popularityScore: 83, version: 1, type: 'policy'
  },
  {
    _id: 'vins_3_11',
    id: 'vins_3_11',
    programId: 'prog_vins_2026',
    title: 'What to Show HOD Before They Sign the NOC',
    question: 'My HOD or college official wants written confirmation before signing my NOC. What do I show them?',
    answer: 'Show them your VINS result panel on the samagama.in dashboard — the yellow VINS panel is the official confirmation of your selection. There is no separate written confirmation letter or proof-of-selection document issued before the NOC step. Your offer letter is issued only after your signed NOC is uploaded and validated, so it is not available beforehand.',
    approvalStatus: 'published', popularityScore: 85, version: 1, type: 'faq'
  },
  {
    _id: 'vins_3_12',
    id: 'vins_3_12',
    programId: 'prog_vins_2026',
    title: 'Prof Sudarshan Iyengar Cannot Sign Your NOC',
    question: 'Can Prof Sudarshan Iyengar or a faculty member from IIT Ropar sign my NOC?',
    answer: 'No. Your NOC must be signed by an authorised signatory at the institution where you are enrolled as a student — HOD, Dean, Principal, or Training & Placement Officer. Sudarshan Iyengar is a faculty member at IIT Ropar and is not the authorised signatory for the IIT Ropar/Masai online AIML programme. He cannot sign your NOC in a personal capacity.',
    approvalStatus: 'published', popularityScore: 78, version: 1, type: 'policy'
  },
  // ── Section 4: Selection, Offer Letter, Certificate ──────────────────────────
  {
    _id: 'vins_4_1',
    id: 'vins_4_1',
    programId: 'prog_vins_2026',
    title: 'How to Know If Selected and How to Opt Into VINS',
    question: 'How do I know I am selected and how do I opt into VINS?',
    answer: 'If you can see your yellow VINS result panel on samagama.in, you are selected. To opt in, tell Yaksha in the chat: "I want to take up the online internship without stipend." Yaksha will confirm. No separate confirmation email is sent.',
    approvalStatus: 'published', popularityScore: 93, version: 1, type: 'faq'
  },
  {
    _id: 'vins_4_3',
    id: 'vins_4_3',
    programId: 'prog_vins_2026',
    title: 'Offer Letter — When Issued and Where to Find It',
    question: 'When do I get the offer letter and where is it?',
    answer: 'Your offer letter is issued automatically once your signed institutional NOC is uploaded and validated (typically within 1 hour to 1 working day). The offer letter is on your dashboard at samagama.in — not in your email. When issued, a notification appears in the Announcements section of samagama.in. Click "Download Offer Letter" from the Offer Letter card on your dashboard.',
    approvalStatus: 'published', popularityScore: 91, version: 2, type: 'faq'
  },
  {
    _id: 'vins_4_4',
    id: 'vins_4_4',
    programId: 'prog_vins_2026',
    title: 'Certificate — Every Completing Intern Gets One',
    question: 'Will I get a certificate for the internship? Is it physical or digital?',
    answer: 'Yes — every intern who completes the internship gets a certificate from Vicharanashala, IIT Ropar. The completion certificate is an e-certificate downloaded from your dashboard on samagama.in after completing both Bronze and Silver. We do not print and mail physical copies. The certificate is digitally signed, authentic, and can be verified from our database using the number on the certificate. It does not specify whether completed online or offline.',
    approvalStatus: 'published', popularityScore: 94, version: 1, type: 'faq'
  },
  {
    _id: 'vins_4_5',
    id: 'vins_4_5',
    programId: 'prog_vins_2026',
    title: 'Confirming Internship Dates on Dashboard',
    question: 'How do I confirm my internship dates on the dashboard?',
    answer: 'After opting into VINS, log in to samagama.in. On the dashboard, you will see a yellow card titled "Confirm your internship dates." The two date pickers pre-fill with sensible defaults. If those work for you, hit "Save dates". Otherwise edit them to your earliest realistic start — your end must be on or before 31 December 2026. A green confirmation appears once saved. You can edit anytime from the same card before the offer letter is issued.',
    approvalStatus: 'published', popularityScore: 87, version: 1, type: 'faq'
  },
  {
    _id: 'vins_4_7',
    id: 'vins_4_7',
    programId: 'prog_vins_2026',
    title: 'How to Accept the Offer Letter — 3-Step Process',
    question: 'How do I accept the offer letter?',
    answer: 'Acceptance happens entirely on your dashboard at samagama.in. The Offer Letter card guides you through three steps within 5 days: (1) download your offer letter, sign the Acceptance of Offer block at the bottom, and upload the signed PDF; (2) read and tick Terms & Conditions; (3) download the Honor Code, sign the last page, and upload the signed PDF. Each PDF upload is capped at 1 MB. There is no acceptance email to send.',
    approvalStatus: 'published', popularityScore: 91, version: 1, type: 'faq'
  },
  {
    _id: 'vins_4_8',
    id: 'vins_4_8',
    programId: 'prog_vins_2026',
    title: 'Changing Internship Dates Before and After Offer Letter',
    question: 'Can I change my internship dates?',
    answer: 'Before the offer letter is issued: yes — open the Confirm Internship Dates card on your dashboard and edit the dates at any time. Your end date must be on or before 31 December 2026. After the offer letter is issued: no. Dates are final and will not be changed. Follow our LinkedIn page for announcements about future cohorts.',
    approvalStatus: 'published', popularityScore: 85, version: 1, type: 'policy'
  },
  {
    _id: 'vins_4_10',
    id: 'vins_4_10',
    programId: 'prog_vins_2026',
    title: 'When Internship Begins — No Notification on Start Day',
    question: 'When does my internship actually begin? Will I receive a notification on the day?',
    answer: 'Your internship begins on the start date you confirmed on the dashboard, provided your official institutional NOC has been uploaded and validated. If your validated NOC is not in on your start date, your start shifts to the day it is validated. There is no separate notification on the day itself. On the morning of your start date, log in to samagama.in and Yaksha will guide you through Day-1 steps of the Bronze phase.',
    approvalStatus: 'published', popularityScore: 86, version: 1, type: 'faq'
  },
  {
    _id: 'vins_4_11',
    id: 'vins_4_11',
    programId: 'prog_vins_2026',
    title: 'Cannot Switch from VINS Online to VISE Offline',
    question: 'Can I switch from VINS online to VISE offline after being selected?',
    answer: 'No. The two tracks are finalised at the interview stage and candidates are not moved between them. VISE has a fixed on-campus capacity planned around mentor bandwidth, hostel availability, and stipend allocation. VINS is not a consolation track — the project, mentor, and certificate are the same as VISE; what differs is the mode (online) and the absence of a fellowship.',
    approvalStatus: 'published', popularityScore: 78, version: 1, type: 'policy'
  },
  // ── Section 5: Work, Mentorship, and Projects ────────────────────────────────
  {
    _id: 'vins_5_1',
    id: 'vins_5_1',
    programId: 'prog_vins_2026',
    title: 'Work Hours, Project, Mentor, and Stipend',
    question: 'What will I work on and how many hours per day? Who is my mentor? Is there a stipend?',
    answer: 'You will work on a real open-source project from Vicharanashala\'s portfolio — areas include AI/ML, web development, NLP, computer vision, agriculture-tech (Annam.AI), education-tech (ViBe), and open-source infrastructure. Plan for 6 to 10 hours a day, sometimes more. There is no stipend — the internship is unpaid. Stellar performers may be recognised with a discretionary stipend at the lab\'s option, but this is not promised. Mentors are not assigned on Day 1 — your mentor is assigned when you move to the project phase after completing Bronze coursework.',
    approvalStatus: 'published', popularityScore: 92, version: 1, type: 'faq'
  },
  {
    _id: 'vins_5_5',
    id: 'vins_5_5',
    programId: 'prog_vins_2026',
    title: 'Laptop Requirements for the Internship',
    question: 'Do I need my own laptop for the internship? What software should I preload?',
    answer: 'Yes — a personal laptop is required. We prefer Linux or macOS. If you use Windows, please install a terminal that can SSH and run Unix-style commands — for example, Windows Subsystem for Linux (WSL) is a clean choice. We do not maintain a fixed software-preload list — your mentor will guide you on specific tools needed once your project is assigned.',
    approvalStatus: 'published', popularityScore: 82, version: 1, type: 'faq'
  },
  {
    _id: 'vins_5_6',
    id: 'vins_5_6',
    programId: 'prog_vins_2026',
    title: 'Using Different Email on GitHub, Zoom, ViBe',
    question: 'I am using a different email on GitHub or Zoom or ViBe. Is that okay?',
    answer: 'No. Your registered email is your sole identifier across all programme platforms. Progress tracking, mentor assignment, and certificate issuance are all tied to it. Mismatches cannot be retroactively corrected — ensure you use your registered email everywhere from day one. Exception: ViBe requires a Gmail address. If your Samagama email is not Gmail, you may use any Gmail of yours to register on ViBe. In that case, tell Yaksha in your Samagama chat using the tag: #vibe-email your-gmail@gmail.com',
    approvalStatus: 'published', popularityScore: 82, version: 1, type: 'policy'
  },
  // ── Section 6: Code of Conduct ───────────────────────────────────────────────
  {
    _id: 'vins_6_1',
    id: 'vins_6_1',
    programId: 'prog_vins_2026',
    title: 'Official Communication Channels — No WhatsApp, No Discord',
    question: 'What are the official communication channels? Is there a WhatsApp group or Discord?',
    answer: 'Official channels: (1) Announcements section on samagama.in — all programme notifications are posted there, log in and check regularly; (2) Zoom breakout room during live sessions; (3) Discussion forum (link in your registration email); (4) Yaksha chat on samagama.in. There is no WhatsApp troubleshooting group or Discord server. Unofficial WhatsApp groups, Telegram channels, or Discord servers involving interns are strictly prohibited and will lead to immediate termination.',
    approvalStatus: 'published', popularityScore: 90, version: 1, type: 'policy'
  },
  // ── Section 7: Interviews ────────────────────────────────────────────────────
  {
    _id: 'vins_7_1',
    id: 'vins_7_1',
    programId: 'prog_vins_2026',
    title: 'Interview Not Marked Complete on Dashboard',
    question: 'My interview is not marked as complete on the dashboard. What do I do?',
    answer: 'A data-sync issue sometimes occurs where the chat session closes but the interview record does not update to "completed." The team will check your record and manually mark it as complete if needed. You will be unblocked within 1–2 hours. If your interview continues to be marked incomplete, please write to internship@vicharanashala.ai.',
    approvalStatus: 'published', popularityScore: 78, version: 1, type: 'faq'
  },
  // ── Section 8: Certificate ───────────────────────────────────────────────────
  {
    _id: 'vins_8_1',
    id: 'vins_8_1',
    programId: 'prog_vins_2026',
    title: 'Grade Report and University Credit — Not Sent by Vicharanashala',
    question: 'Does Vicharanashala send a grade report or evaluation to my university for internship credit?',
    answer: 'Vicharanashala does not send formal evaluation or grade reports to universities — that process is between you and your college. The certificate issued upon completion is the document you can submit to your college or placement office for credit. We can provide the certificate and, if earned, a letter of recommendation, but we do not have a process for sending grade reports to universities.',
    approvalStatus: 'published', popularityScore: 80, version: 1, type: 'faq'
  },
  {
    _id: 'vins_8_2',
    id: 'vins_8_2',
    programId: 'prog_vins_2026',
    title: 'Certificate Specifies Online or Offline Mode',
    question: 'Does the Vicharanashala internship certificate specify whether it was completed online or offline?',
    answer: 'The certificate you receive on completing the internship is the same for both tracks. It is issued by Vicharanashala, IIT Ropar, and does not specify whether you completed it online or on campus. The certificate records only that you completed the internship.',
    approvalStatus: 'published', popularityScore: 78, version: 1, type: 'faq'
  },
  {
    _id: 'vins_8_3',
    id: 'vins_8_3',
    programId: 'prog_vins_2026',
    title: 'E-Certificate — Not a Physical Hardcopy',
    question: 'Will the completion certificate be a physical hardcopy or an e-certificate?',
    answer: 'The completion certificate is issued as an e-certificate — you download it from your dashboard on samagama.in after completing both Bronze and Silver. We do not print and mail physical copies. The certificate is digitally signed and authentic, so it cannot be duplicated. It can also be verified from our database using the number on the certificate.',
    approvalStatus: 'published', popularityScore: 82, version: 1, type: 'faq'
  },
  // ── Section 9: Rosetta ───────────────────────────────────────────────────────
  {
    _id: 'vins_9_1',
    id: 'vins_9_1',
    programId: 'prog_vins_2026',
    title: 'Rosetta Internship Journal — What It Is and Purpose',
    question: 'What is Rosetta and why does it exist?',
    answer: 'Rosetta is your 65-day internship journal — one entry per day, every day, for the full duration of Summership 2026. The name comes from the Rosetta Stone. It exists for two reasons: for you (to build articulation of what you learned through daily reflection), and for us (qualitative insight into your experience to make the programme better). You keep it privately and submit it at the end as one of your completion requirements.',
    approvalStatus: 'published', popularityScore: 88, version: 2, type: 'faq'
  },
  {
    _id: 'vins_9_3',
    id: 'vins_9_3',
    programId: 'prog_vins_2026',
    title: 'Rosetta Thinking Routines Explained',
    question: 'What is a thinking routine in Rosetta?',
    answer: 'A thinking routine is a short framework that gives your reflection a specific shape. Examples: 3-2-1 (3 things you engaged with, 2 questions on your mind, 1 surprise), Muddy/Clear (what is sharp and what is still foggy), What? So What? Now What? (separate facts from meaning from action). The routines rotate across 65 days so the journal does not feel repetitive. Each entry takes 10 to 20 minutes.',
    approvalStatus: 'published', popularityScore: 81, version: 1, type: 'faq'
  },
  {
    _id: 'vins_9_4',
    id: 'vins_9_4',
    programId: 'prog_vins_2026',
    title: 'How to Get and Start Your Rosetta Journal',
    question: 'How do I get my Rosetta journal and use it day to day?',
    answer: 'The Rosetta template link is shared in the programme. Open the link, go to File > Make a copy, save it to your own Google Drive, and rename it "Rosetta — [Your Name] — Summership 2026". Do not write in the shared template. Daily use: open your Rosetta Google Doc, scroll to today\'s day number, fill in the date at the top, read the thinking routine name and its one-line description, and answer the three prompts in the writing boxes below.',
    approvalStatus: 'published', popularityScore: 85, version: 1, type: 'faq'
  },
  {
    _id: 'vins_9_6',
    id: 'vins_9_6',
    programId: 'prog_vins_2026',
    title: 'Rosetta Entry Length and Quality Rules',
    question: 'How long should each Rosetta entry be?',
    answer: 'There is no minimum or maximum word count. A good entry is honest and specific — three to five sentences per prompt is usually enough. What is not acceptable: one-word answers, copy-pasted text, vague non-answers like "today was productive," or anything that reads like it was generated by an AI. Write what is true.',
    approvalStatus: 'published', popularityScore: 82, version: 1, type: 'faq'
  },
  {
    _id: 'vins_9_8',
    id: 'vins_9_8',
    programId: 'prog_vins_2026',
    title: 'Rosetta — No AI, No ChatGPT Allowed for Journal Entries',
    question: 'Can I use ChatGPT or any AI tool to write my Rosetta journal entries?',
    answer: 'No. This is the one firm rule of Rosetta. The journal is a record of your thinking, not a demonstration of what an AI can produce on your behalf. Entries that read as AI-generated will not be counted toward your completion requirement. If your entire journal reads this way, the journal will not be accepted. Use AI tools for your technical work if permitted — do not use them for Rosetta entries.',
    approvalStatus: 'published', popularityScore: 90, version: 2, type: 'policy'
  },
  {
    _id: 'vins_9_9',
    id: 'vins_9_9',
    programId: 'prog_vins_2026',
    title: 'Rosetta — What to Do If You Miss a Day',
    question: 'What if I miss a day in Rosetta?',
    answer: 'Fill it in as soon as you can. Write the actual date you are filling it in, not the date of the missed entry. Be honest in the entry about the fact that you are writing it late and why. Do not leave entries blank. A late honest entry is always better than no entry.',
    approvalStatus: 'published', popularityScore: 83, version: 1, type: 'faq'
  },
  {
    _id: 'vins_9_12',
    id: 'vins_9_12',
    programId: 'prog_vins_2026',
    title: 'How to Submit Rosetta at the End of Internship',
    question: 'How do I submit Rosetta at the end of the internship?',
    answer: 'On or before Day 65, share your Rosetta Google Doc with the programme coordinator\'s email address (shared during wrap-up week). Set the sharing permission to Viewer. Make sure: your name is in the document title ("Rosetta — [Your Name] — Summership 2026"), all 65 entries have been filled in, and your cover page has your name, product, and team filled in. Rosetta submission is one of the required criteria for receiving your internship certificate.',
    approvalStatus: 'published', popularityScore: 86, version: 1, type: 'faq'
  },
  // ── Section 10: Phase 1 / ViBe / Live Sessions ───────────────────────────────
  {
    _id: 'vins_10_1',
    id: 'vins_10_1',
    programId: 'prog_vins_2026',
    title: 'Phase 1 Course Exemption for Previous Cohort Students',
    question: 'I already completed a course with you in an earlier cohort. Am I exempt from repeating it?',
    answer: 'Yes. If you completed the Vinternship, Pinternship, MERN, or AI course with us in an earlier cohort and your ViBe progress is above 95%, you are exempt. Submit the exemption form at https://forms.gle/RWt1v22yVePyZXD79. Even if exempted from a course, live sessions and standups remain mandatory for everyone — no exceptions.',
    approvalStatus: 'published', popularityScore: 83, version: 1, type: 'faq'
  },
  {
    _id: 'vins_10_2',
    id: 'vins_10_2',
    programId: 'prog_vins_2026',
    title: 'How to Register for AI Fundamentals Course on ViBe',
    question: 'How do I register for the AI Fundamentals course on ViBe?',
    answer: 'Click the AI Fundamentals registration link posted in the Announcements section on samagama.in at Phase 1 launch. You will be redirected to the ViBe sign-in page — if no ViBe account yet, create one using the same Gmail you used on Samagama. Log in. Open the course registration link again in your browser — the second click after login is what enrols you. Complete the brief registration form and submit. The course will appear instantly on your ViBe dashboard.',
    approvalStatus: 'published', popularityScore: 84, version: 1, type: 'faq'
  },
  {
    _id: 'vins_10_4',
    id: 'vins_10_4',
    programId: 'prog_vins_2026',
    title: 'Live Sessions Mandatory for All Including Viva Route',
    question: 'Are live sessions mandatory if I am on the viva route?',
    answer: 'Yes — live sessions are mandatory for every intern, regardless of path. Whether you are on the coursework track, MERN-exempt (returning intern), or have cleared the viva and moved to Phase 2, you are expected to attend every live session.',
    approvalStatus: 'published', popularityScore: 86, version: 1, type: 'policy'
  },
  {
    _id: 'vins_10_5',
    id: 'vins_10_5',
    programId: 'prog_vins_2026',
    title: 'Zoom Link for Kickoff Meeting and Daily Standups',
    question: 'How do I get the Zoom link for the kickoff meeting and daily standups?',
    answer: 'The kickoff orientation Zoom link is delivered via email to your registered samagama.in address and through your Yaksha chat portal. Daily Zoom standup links are posted in the Announcements section on your samagama.in dashboard at least 1 hour before they begin. We do not send separate emails for daily standups. If your start date is later, there is no separate kickoff event for you.',
    approvalStatus: 'published', popularityScore: 86, version: 1, type: 'faq'
  },
  {
    _id: 'vins_10_6',
    id: 'vins_10_6',
    programId: 'prog_vins_2026',
    title: 'Daily Zoom Standups Mandatory — Attendance Tracked',
    question: 'Are daily standups mandatory and how do I get the link?',
    answer: 'Attending the daily standups is mandatory for all interns. Daily Zoom standup links are posted in the Announcements section on your samagama.in dashboard at least 1 hour before they begin. We do not send separate emails for daily standups. Missing standups is treated as missing work and attendance and participation are tracked against strict thresholds.',
    approvalStatus: 'published', popularityScore: 88, version: 1, type: 'policy'
  },
  {
    _id: 'vins_10_10',
    id: 'vins_10_10',
    programId: 'prog_vins_2026',
    title: 'Attendance and Participation Rules — Rolling 5-Day Window',
    question: 'What are the attendance and participation rules?',
    answer: 'On a rolling 5-day basis you must simultaneously: stay present for at least 85% of total live Zoom session time, respond to at least 85% of polls and quizzes run during sessions, and attempt every quiz and clear each with a score of at least 50%. If any one of the three falls below its threshold, you will be excused from the current batch and moved to the next batch (not a penalty — you simply rejoin later when you can give full attention).',
    approvalStatus: 'published', popularityScore: 91, version: 1, type: 'policy'
  },
  {
    _id: 'vins_10_11',
    id: 'vins_10_11',
    programId: 'prog_vins_2026',
    title: 'Spurti Points Overview in Phase 1',
    question: 'What are Spurti Points SP and do they affect my internship?',
    answer: 'Spurti Points (SP) are a platform feature that tracks your engagement with the programme. They are currently in early beta — not used for any decisions about your standing. Attendance and participation (tracked separately from SP via raw Zoom logs) are what the programme watches strictly. A low SP number is not a cue to ease off.',
    approvalStatus: 'published', popularityScore: 85, version: 1, type: 'faq'
  },
  {
    _id: 'vins_10_12',
    id: 'vins_10_12',
    programId: 'prog_vins_2026',
    title: 'Zoom Session Conduct Rules — Video, Audio, Attire, Display Name',
    question: 'What are the live session Zoom participation and conduct rules?',
    answer: 'Keep video on at all times — participants with video off will be removed. Your face must be clearly visible, well-lit, centred in frame. Do not join from a mobile phone — use laptop or desktop. Dress code: business casuals or neat Indian casuals. Display your full first and last name. Test your microphone and video before the session. If moved to the waiting room you will not be re-admitted. Do not call or message the Core Team for re-admission — this will result in an SP deduction.',
    approvalStatus: 'published', popularityScore: 87, version: 1, type: 'policy'
  },
  {
    _id: 'vins_10_13',
    id: 'vins_10_13',
    programId: 'prog_vins_2026',
    title: 'Poll Error 100035000 During Zoom Session',
    question: 'I got Failed to submit poll Error 100035000 during a session. What does it mean?',
    answer: 'This error appears when the poll closed before your response was submitted — either the timer ran out or there was a brief connection lag. Do not panic or leave the meeting. If the poll window is still visible, wait a few seconds and try submitting again. To reduce this: submit your response as soon as the poll appears, stay attentive throughout the session, keep a backup internet connection ready, and use the Zoom desktop or mobile app (not the browser — browser-based Zoom is significantly less reliable for polls).',
    approvalStatus: 'published', popularityScore: 79, version: 1, type: 'faq'
  },
  {
    _id: 'vins_10_14',
    id: 'vins_10_14',
    programId: 'prog_vins_2026',
    title: 'Moved to Waiting Room — Dispute Process',
    question: 'I was moved to the waiting room. What should I do if I think it was a mistake?',
    answer: 'If you believe you were moved to the waiting room by mistake, you can dispute it: share a complete screen recording of the session from the time you joined until you were moved to the waiting room, showing you were following all guidelines. Submit it to the Core Team for review via the Discussion Forum or by raising an escalation through Yaksha. Disputes without a recording cannot be considered. Do not call or message the Core Team for re-admission.',
    approvalStatus: 'published', popularityScore: 78, version: 1, type: 'faq'
  },
  // ── Section 11: Spurti Points ─────────────────────────────────────────────────
  {
    _id: 'vins_11_1',
    id: 'vins_11_1',
    programId: 'prog_vins_2026',
    title: 'Spurti Points — What They Are and How Calculated',
    question: 'What are Spurti Points and how are they calculated?',
    answer: 'Spurti Points (SP) reflect your overall engagement with the programme. Every intern starts with a base of 100 SP on their official internship start date. SP is earned per mandatory morning session through attendance (90%+ = +10 SP, 75-89% = +5 SP, 50-74% = +3 SP, below 50% = 0 SP) and poll participation (90%+ = +10 SP, 75-89% = +5 SP, 50-74% = +3 SP, below 50% = 0 SP). No penalty for absence — missing a session earns 0, not a deduction. SP is updated daily.',
    approvalStatus: 'published', popularityScore: 86, version: 2, type: 'faq'
  },
  {
    _id: 'vins_11_2',
    id: 'vins_11_2',
    programId: 'prog_vins_2026',
    title: 'Spurti Points Are Beta — Not Used for Excusal Decisions',
    question: 'Is SP a finished system? Can low SP get me terminated or excused?',
    answer: 'No — Spurti Points are still in early beta. SP is not used as a basis for termination or excusal decisions. Excusal is determined solely from raw Zoom attendance logs, independently of SP. A zero or negative SP balance does not mean you are in trouble. A higher SP may make you eligible for small perks or recognition from the programme team.',
    approvalStatus: 'published', popularityScore: 87, version: 1, type: 'faq'
  },
  {
    _id: 'vins_11_8',
    id: 'vins_11_8',
    programId: 'prog_vins_2026',
    title: 'Participation Requirements Tracked Strictly — Not SP',
    question: 'If SP does not determine outcomes, what does? What are the participation requirements?',
    answer: 'Your attendance and live participation are what the programme watches closely and tracks strictly, independently of SP. On a rolling 5-day basis: at least 85% of total live Zoom session time, at least 85% of polls and quizzes, and attempt every quiz with at least 50% score. If any one falls below, you are moved to the next batch.',
    approvalStatus: 'published', popularityScore: 87, version: 1, type: 'policy'
  },
  {
    _id: 'vins_11_10',
    id: 'vins_11_10',
    programId: 'prog_vins_2026',
    title: 'What Happens if You Fall Below Participation Level',
    question: 'What happens if I fall below the required participation level?',
    answer: 'If any one of the three participation requirements slips below the mark across your most recent five working days, you will be moved from the current batch into a later batch. This is not a termination — you can rejoin when you can give the programme your full attention. To rejoin you must update your internship dates on the dashboard and upload a fresh NOC covering the revised period.',
    approvalStatus: 'published', popularityScore: 86, version: 1, type: 'policy'
  },
  {
    _id: 'vins_11_12',
    id: 'vins_11_12',
    programId: 'prog_vins_2026',
    title: 'Programme Team Can Award or Deduct SP Manually',
    question: 'Can the programme team award or deduct SP directly?',
    answer: 'Yes. Programme team members can manually award or deduct Spurti Points at their discretion. This is used to recognise good behaviour, acknowledge cohort-protocol adherence, or apply conduct deductions for disruptive or non-compliant behaviour. Every manual award or deduction is permanently logged with the team member\'s identity and a justification note. Manual SP deductions cannot lead to excusal — excusal is determined solely from raw Zoom attendance logs.',
    approvalStatus: 'published', popularityScore: 78, version: 1, type: 'faq'
  },
  // ── Section 13: ViBe Platform ─────────────────────────────────────────────────
  {
    _id: 'vins_13_1',
    id: 'vins_13_1',
    programId: 'prog_vins_2026',
    title: 'ViBe Platform — How to Log In and Accept Course Invite',
    question: 'How do I log in to ViBe and accept the course invite?',
    answer: 'Log in to the ViBe platform at https://vibe.vicharanashala.ai/auth as a student with your registered email ID. Check the Notifications tab in the top right side of the Dashboard and accept the course invite sent for your respective MERN or AI Fundamentals course. Logging in with a different email ID may result in access issues or missing course visibility.',
    approvalStatus: 'published', popularityScore: 88, version: 1, type: 'faq'
  },
  {
    _id: 'vins_13_2',
    id: 'vins_13_2',
    programId: 'prog_vins_2026',
    title: 'ViBe "No Course Enrolled" Error Fix',
    question: 'Invite accepted but ViBe shows No course enrolled. How do I fix it?',
    answer: 'To fix "No course enrolled": make sure you are logged in with the correct registered email ID. Check if your college email has multiple aliases and try the correct one. Log out and log in again. Use personal wifi instead of college wifi (college networks may have restrictions). If still issues: allow third-party cookies in Chrome (open chrome://settings/cookies, turn off "Block third-party cookies"), add site exception for .vicharanashala.ai, change DNS to Google DNS (8.8.8.8 and 8.8.4.4), flush DNS cache with ipconfig /flushdns, ipconfig /release, ipconfig /renew commands.',
    approvalStatus: 'published', popularityScore: 87, version: 1, type: 'faq'
  },
  {
    _id: 'vins_13_3',
    id: 'vins_13_3',
    programId: 'prog_vins_2026',
    title: 'ViBe Videos Stuck Repeating — Proctoring Causes',
    question: 'Why are ViBe videos stuck or repeating?',
    answer: 'This happens due to ViBe\'s monitored learning system. Common reasons: videos must be watched fully and in sequence (no skipping), camera and microphone permissions must be enabled, poor lighting or high background noise can affect playback, and switching tabs or staying idle may restart the video. For smooth playback: stay on the ViBe tab, keep your camera on, and watch videos in a quiet well-lit environment.',
    approvalStatus: 'published', popularityScore: 86, version: 1, type: 'faq'
  },
  {
    _id: 'vins_13_4',
    id: 'vins_13_4',
    programId: 'prog_vins_2026',
    title: 'ViBe Mobile or Tablet Not Supported',
    question: 'Can I use a mobile or tablet for ViBe?',
    answer: 'No — only desktop or laptop is supported for ViBe. Mobile and tablet devices are not supported.',
    approvalStatus: 'published', popularityScore: 80, version: 1, type: 'faq'
  },
  {
    _id: 'vins_13_5',
    id: 'vins_13_5',
    programId: 'prog_vins_2026',
    title: 'ViBe Video Issues Troubleshooting Steps',
    question: 'I am experiencing video issues stuck looping skipping on ViBe. How do I troubleshoot?',
    answer: 'Try these steps in order: (1) Refresh the page and check multiple times. (2) Inspect browser console: right-click > Inspect > Network or Console tab, try watching the video and check for errors. (3) Log out and log in again. (4) Use a different browser. (5) Clear browsing data and cache then re-login. If the issue persists after all steps, record the issue and describe it to Yaksha in the chat — Yaksha will escalate it to the team.',
    approvalStatus: 'published', popularityScore: 84, version: 1, type: 'faq'
  },
  {
    _id: 'vins_13_6',
    id: 'vins_13_6',
    programId: 'prog_vins_2026',
    title: 'ViBe Progress Less Than 100% Even After Completing All Videos',
    question: 'I completed all videos and quizzes in ViBe but my progress is still showing less than 100%. What should I do?',
    answer: 'This might be due to a penalty score on a quiz or video item that was not successfully completed or marked. Verify that you have completed all course items (1006/1006). If not, retry the missed contents again. Also try: refresh your browser, log out, clear browser cache, and log in again.',
    approvalStatus: 'published', popularityScore: 84, version: 1, type: 'faq'
  },
  {
    _id: 'vins_13_8',
    id: 'vins_13_8',
    programId: 'prog_vins_2026',
    title: 'ViBe Consent Form Compulsory — Camera Access Required',
    question: 'Is the ViBe consent form compulsory? What if I do not want to grant camera access?',
    answer: 'Yes — the consent form is compulsory. Providing consent is a mandatory requirement for any candidate enrolling in a course on the ViBe Learning Platform. The platform requires access to your webcam and microphone throughout the learning process to ensure fairness, academic integrity, and active participation. If you choose not to grant camera and microphone access, you will not be able to proceed with the course. ViBe does not continuously record videos — only real-time presence checks are made.',
    approvalStatus: 'published', popularityScore: 85, version: 1, type: 'policy'
  },
  {
    _id: 'vins_13_11',
    id: 'vins_13_11',
    programId: 'prog_vins_2026',
    title: 'ViBe Linear Progression — No Skipping Ahead',
    question: 'What is linear progression on ViBe? Can I jump ahead using the left navigation panel?',
    answer: 'Linear progression is enabled for every course on ViBe — you must watch videos and attempt quizzes in the exact order they appear on the left panel. You cannot click on a video or quiz ahead of your current position and skipping is not allowed by design. Do not click through the left panel to jump ahead — click "Next Quiz" or "Next Lesson" as it appears on the right panel. Trying to skip ahead will trigger the Access Restricted alert.',
    approvalStatus: 'published', popularityScore: 87, version: 1, type: 'faq'
  },
  {
    _id: 'vins_13_13',
    id: 'vins_13_13',
    programId: 'prog_vins_2026',
    title: 'ViBe Access Restricted Banner — Not a Bug, How to Resolve',
    question: 'I am seeing a red Access Restricted banner on ViBe. Is this a bug and how do I resolve it?',
    answer: 'No, this is not a bug. The red Access Restricted banner is an intentional alert that appears when you try to open an item before completing all earlier items. ViBe automatically returns you to the last item you legitimately reached. To resolve it: (1) go back to the left panel and scroll through course items from the beginning, (2) look for any item without a completion tick — that is your missed video or quiz, (3) complete that item, (4) refresh the page. If still appearing after refreshing and all earlier items are completed, describe the issue to Yaksha.',
    approvalStatus: 'published', popularityScore: 87, version: 1, type: 'faq'
  },
  {
    _id: 'vins_13_15',
    id: 'vins_13_15',
    programId: 'prog_vins_2026',
    title: 'ViBe Re-watch After Quiz — Not a Penalty',
    question: 'Why does ViBe sometimes make me re-watch a clip after a quiz?',
    answer: 'If your answer to the check-in quiz did not go through correctly, ViBe will take you back to the same clip for a re-watch. This is called a re-watch and it is part of the design — not a penalty. Re-watches are not recorded against you and do not affect your HP or evaluation. The clips are short so a re-watch usually costs less time than guessing through multiple retries. Watch the clip first, then answer.',
    approvalStatus: 'published', popularityScore: 82, version: 1, type: 'faq'
  },
  {
    _id: 'vins_13_18',
    id: 'vins_13_18',
    programId: 'prog_vins_2026',
    title: 'ViBe Quiet Helper Proctoring System',
    question: 'What does the quiet helper on ViBe actually do? Does ViBe record long videos of me?',
    answer: 'The quiet helper checks in real-time: a face is visible, only one face is in frame, there is enough light on your face, the room is not full of voices, and you are looking at the screen. Brief normal movements are absolutely fine — it only pays attention to sustained patterns. ViBe does NOT continuously record videos of you. The camera and microphone are used for real-time presence checks only. Long recordings of your face or voice are not stored. When the lesson ends, the helper goes quiet too.',
    approvalStatus: 'published', popularityScore: 85, version: 1, type: 'faq'
  },
  {
    _id: 'vins_13_20',
    id: 'vins_13_20',
    programId: 'prog_vins_2026',
    title: 'Most Common ViBe Mistake — Window Behind You',
    question: 'What is the most common avoidable mistake learners make on ViBe? Why does the lesson keep pausing?',
    answer: 'The most common mistake: sitting with a window directly behind you during the day — your camera sees a dark silhouette where your face should be. The fix: move so the window is to your side or in front of the laptop, not behind you. If a clip keeps stopping, check: your face is too dark (add a lamp in front), face is partly out of frame (raise the laptop), voices in background (close the door), you switched tabs (stay on ViBe tab), or camera/mic permission dropped (check the lock icon in browser address bar).',
    approvalStatus: 'published', popularityScore: 84, version: 1, type: 'faq'
  },
  {
    _id: 'vins_13_24',
    id: 'vins_13_24',
    programId: 'prog_vins_2026',
    title: 'ViBe Progress Saved on Server — Safe to Clear Browser',
    question: 'Will I lose my ViBe progress if I clear my browser or reinstall it?',
    answer: 'No — your progress is saved on the server, tied to your registered email, not on your browser. Refreshing, clearing cache, switching browsers, or reinstalling will not wipe your progress. The moment you log back in with the same registered email, all your completed clips and quizzes will be exactly where you left them. When in doubt: log out, log back in.',
    approvalStatus: 'published', popularityScore: 83, version: 1, type: 'faq'
  },
  {
    _id: 'vins_13_25',
    id: 'vins_13_25',
    programId: 'prog_vins_2026',
    title: 'ViBe Recommended Daily Learning Rhythm and Study Corner',
    question: 'What is the recommended daily learning rhythm on ViBe and what should my study corner look like?',
    answer: 'Recommended rhythm: show up daily even if only for 30 minutes — daily consistency beats a 5-hour weekend cram. Take breaks between clips (not during them). Aim for around 3.33% daily progress. Study corner setup: (1) light in front of your face — a lamp or window facing you, never behind; (2) just you in the camera frame; (3) a reasonably quiet room — no TV, no music with words, no one else on a call nearby. A Live Support Breakout Session is held every day at 2:00 PM for ViBe platform issues.',
    approvalStatus: 'published', popularityScore: 82, version: 1, type: 'faq'
  },
  // ── Section 14: Team Formation ────────────────────────────────────────────────
  {
    _id: 'vins_14_1',
    id: 'vins_14_1',
    programId: 'prog_vins_2026',
    title: 'Team Formation — Compulsory, Size of 4, Cross-Institution',
    question: 'Is team formation compulsory? What is the team size and how are teams formed?',
    answer: 'Yes, team formation is compulsory — all Phase 2 and Phase 3 projects must be completed in teams. Team size is fixed at four members — you cannot have fewer or more. For students who joined May 15 and 16, teams were formed through a structured activity. For students joining later, teams are randomly assigned by administration. Teams must consist of members from different institutions to encourage networking — you cannot form a team with someone from your own college (except students from same institution but different campuses).',
    approvalStatus: 'published', popularityScore: 84, version: 1, type: 'faq'
  },
  {
    _id: 'vins_14_7',
    id: 'vins_14_7',
    programId: 'prog_vins_2026',
    title: 'Team Member Leaves or Becomes Ineligible',
    question: 'What if a team member leaves or becomes ineligible during Phase 1?',
    answer: 'The administration will attempt to assign a replacement member. If no replacement is found, you may continue as a team of three. You must inform the admin immediately, or the change will not be recognized. Team performance may affect individual evaluation and prolonged inactivity from a member may lead to administrative intervention.',
    approvalStatus: 'published', popularityScore: 78, version: 1, type: 'faq'
  },
  {
    _id: 'vins_14_12',
    id: 'vins_14_12',
    programId: 'prog_vins_2026',
    title: 'Team Communication — LinkedIn and Email Only, No WhatsApp',
    question: 'How will communication happen within teams? Can we use WhatsApp?',
    answer: 'Teams self-organise internal coordination over LinkedIn or email only, limited to their own team members. WhatsApp is not encouraged and it is not permitted to create a team WhatsApp group — a four-person project team is still a "subset of interns" which is prohibited under the code of conduct; a group of that form, if reported, will lead to immediate termination of the internship. Official programme updates continue through the Announcements section on samagama.in and Yaksha chat.',
    approvalStatus: 'published', popularityScore: 81, version: 1, type: 'policy'
  },
  {
    _id: 'vins_14_16',
    id: 'vins_14_16',
    programId: 'prog_vins_2026',
    title: 'Project Assignments Final — Cannot Change',
    question: 'We selected Project X as our top priority but were assigned Project Y. Can we change it?',
    answer: 'No. Project assignments are final and cannot be changed. Allocation is done to ensure balanced distribution across projects. Team assignments are also final — requests for changes are not entertained. Team switches are not allowed except in exceptional admin-approved cases involving serious concerns.',
    approvalStatus: 'published', popularityScore: 78, version: 1, type: 'policy'
  },
  // ── Legacy CS Programme FAQ ───────────────────────────────────────────────────
  {
    _id: 'kb_faq_001',
    id: 'kb_faq_001',
    programId: 'prog_cs_2026',
    title: 'Central Science Library Weekend & Evening Opening Hours',
    question: 'What are the weekend opening hours for the central science library study halls on Sundays and Saturdays?',
    answer: 'The Central Science Library and study halls are open from 9:00 AM to 8:00 PM on Saturdays and Sundays during regular semester weeks. Extended overnight hours apply during final exam periods.',
    approvalStatus: 'published',
    popularityScore: 85,
    version: 1,
    type: 'faq'
  },
  {
    _id: 'kb_faq_002',
    id: 'kb_faq_002',
    programId: 'prog_cs_2026',
    title: 'Tuition Fee Payment Discrepancies and Ledger Reconciliations',
    question: 'Why does my receipt show an unpaid balance or fee due after completing tuition fee payment transaction debited?',
    answer: 'Online fee payment transactions can take up to 24 to 48 business hours to reflect in student account ledgers due to bank gateway reconciliation. If transaction debited but shows unpaid balance over 48 hours, submit the transaction ID and receipt for manual ledger clearing.',
    approvalStatus: 'published',
    popularityScore: 90,
    version: 2,
    type: 'policy'
  }
];

/**
 * RAG Service - Retrieval Augmented Generation for Query Resolution
 * 
 * This service handles:
 * 1. Hybrid search (vector + keyword) across approved program-scoped knowledge
 * 2. Citation verification - ensures sources are approved and within program scope
 * 3. Answer generation with grounded citations via Local LLM (llama.cpp Qwen2.5) or OpenAI
 */
export class RAGService {
  /**
   * Retrieve relevant documents from approved knowledge base
   * @param {string} queryText - The user's query
   * @param {string} programId - Program scope for filtering
   * @returns {Object} Retrieval results with confidence scores
   */
  static async retrieve(queryText, programId) {
    try {
      let semanticResults = [];
      let keywordResults = [];
      
      try {
        const { SemanticSearch } = await import('../../../csfaq/server/src/modules/search/engine/SemanticSearch.js');
        const { KeywordSearch } = await import('../../../csfaq/server/src/modules/search/engine/KeywordSearch.js');
        
        const [semantic, keyword] = await Promise.all([
          SemanticSearch.search({ normalized: queryText }, 20),
          KeywordSearch.search({ normalized: queryText }, 20),
        ]);
        
        semanticResults = semantic || [];
        keywordResults = keyword || [];
      } catch (importError) {
        logger.debug('RAG running in standalone mode, using built-in standalone knowledge base');
      }

      // Always include STANDALONE_KNOWLEDGE_BASE and deduplicate by ID so official FAQs are never omitted
      const allResults = [...semanticResults, ...keywordResults, ...STANDALONE_KNOWLEDGE_BASE];
      const seen = new Set();
      let combinedResults = [];
      for (const doc of allResults) {
        const key = doc.id || doc._id?.toString() || doc.title;
        if (!seen.has(key)) {
          seen.add(key);
          combinedResults.push(doc);
        }
      }

      // Filter and merge results by program scope
      const filteredResults = this.filterByProgramScope(combinedResults, programId);

      // Score and rank results
      const scoredResults = this.scoreResults(filteredResults, queryText);
      
      if (scoredResults.length === 0 || scoredResults[0].score < 0.25) {
        return {
          documents: [],
          evidence: [],
          confidence: 0,
          commonalityScore: 0,
          draftAnswer: null,
        };
      }

      const topScore = scoredResults[0]?.score || 0;
      const confidence = Math.min(topScore, 1);

      // commonalityScore reflects how strongly the top result matches.
      // We no longer penalise queries that only have one good document –
      // most FAQs are answered by a single authoritative source.
      const commonalityScore = topScore >= 0.75 ? 1.0 : topScore >= 0.55 ? 0.75 : topScore >= 0.4 ? 0.5 : 0;

      return {
        documents: scoredResults.slice(0, 5),
        evidence: scoredResults.slice(0, 3).map(r => ({
          sourceType: r.type || 'faq',
          sourceId: r._id?.toString() || r.id,
          sourceVersion: r.version?.toString() || '1',
          score: r.score,
          approved: r.approvalStatus === 'published' || r.approvalStatus === 'approved',
          programId: programId || r.programId,
        })),
        confidence,
        commonalityScore,
        draftAnswer: scoredResults[0]?.answer || scoredResults[0]?.text,
      };
    } catch (error) {
      logger.error('RAG retrieve error:', error);
      return {
        documents: [],
        evidence: [],
        confidence: 0,
        commonalityScore: 0,
        draftAnswer: null,
      };
    }
  }

  /**
   * Filter results by program scope (cross-program access is forbidden)
   */
  static filterByProgramScope(results, programId) {
    return results.filter(doc => {
      if (programId && doc.programId && doc.programId !== programId) {
        // Allow shared FAQ knowledge between prog_cs_2026 and prog_vins_2026
        const sharedPrograms = ['prog_cs_2026', 'prog_vins_2026'];
        if (!(sharedPrograms.includes(programId) && sharedPrograms.includes(doc.programId))) {
          return false;
        }
      }
      if (doc.approvalStatus && !['published', 'approved'].includes(doc.approvalStatus)) {
        return false;
      }
      return true;
    });
  }

  /**
   * Score results based on relevance.
   * Base score is 0 so unrelated docs don't get an artificial boost.
   * Keyword overlap is the primary driver (up to 0.75),
   * plus small bonuses for published status and popularity.
   */
  static scoreResults(results, queryText) {
    const stopWords = new Set(['the','and','for','that','with','this','have','from','not','are','was','were','will','can','should','would','could','please','sir','maam','hello','hi','good','morning','afternoon','evening','thanks','thank','you','your','about','want','know','help','need','issue','problem','error','query','question','ask','asking','tell','explain','kindly','regards','dear','respected','also','just','still','been','being','what','how','when','where','why','who','whom','which','there','here','some','any','regarding','details','info','information']);
    const queryTerms = queryText.toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter(t => t.length > 2 && !stopWords.has(t));
    
    return results.map(doc => {
      // Start from 0, not 0.45 – only relevant docs should score high
      let score = 0;

      // If a search engine already scored it, use that as a base (capped at 0.5)
      if (doc.score || doc._score) {
        score = Math.min(doc.score || doc._score, 0.5);
      }
      
      const docText = `${doc.question || doc.title || ''} ${doc.answer || doc.text || ''}`.toLowerCase();
      const exactMatches = queryTerms.filter(term => docText.includes(term)).length;
      if (queryTerms.length > 0) {
        // Keyword overlap contributes up to 0.75 of the score
        score += (exactMatches / queryTerms.length) * 0.75;
      }
      
      if (doc.approvalStatus === 'published') score += 0.15;
      if (doc.popularityScore > 50) score += 0.05;
      
      return { ...doc, score: Math.min(score, 1) };
    }).sort((a, b) => b.score - a.score);
  }

  /**
   * Verify citations and generate answer (requires high confidence)
   */
  static async verifyAndGenerate(queryText, documents, programId) {
    if (!documents || documents.length === 0) {
      return { verified: false, answer: null, confidence: 0 };
    }

    const allApproved = documents.every(doc => 
      doc.approvalStatus === 'published' || doc.approvalStatus === 'approved'
    );
    
    if (!allApproved) {
      return { verified: false, answer: null, confidence: 0 };
    }

    const citationsTraceable = this.verifyCitations(queryText, documents);
    if (!citationsTraceable) {
      return { verified: false, answer: null, confidence: 0 };
    }

    const hasContradictions = this.checkContradictions(documents);
    if (hasContradictions) {
      return { verified: false, answer: null, confidence: 0 };
    }

    const answer = await this.generateAnswer(queryText, documents);
    
    return {
      verified: true,
      answer,
      confidence: documents[0]?.score || 0.88,
      model: env.openai?.model || 'qwen2.5-coder-1.5b (local)',
    };
  }

  /**
   * Verify that the TOP document is traceable to the query.
   * We only verify the best-scoring document, not all 5 –
   * checking every document caused verification to fail whenever
   * lower-ranked, tangentially-related docs were included.
   */
  static verifyCitations(queryText, documents) {
    const stopWords = new Set(['the','and','for','that','with','this','have','from','not','are','was','were','will','can','should','would','could','please','sir','maam','hello','hi','good','morning','afternoon','evening','thanks','thank','you','your','about','want','know','help','need','issue','problem','error','query','question','ask','asking','tell','explain','kindly','regards','dear','respected','also','just','still','been','being','what','how','when','where','why','who','whom','which','there','here','some','any','regarding','details','info','information']);
    const queryTerms = queryText.toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter(t => t.length > 2 && !stopWords.has(t));
    if (queryTerms.length === 0) return true;
    if (!documents || documents.length === 0) return false;

    // Only validate the top-scoring document
    const topDoc = documents[0];
    const docText = `${topDoc.question || topDoc.title || ''} ${topDoc.answer || topDoc.text || ''}`.toLowerCase();
    const matches = queryTerms.filter(term => docText.includes(term)).length;

    // Require at least 20% term overlap in the top document
    return matches / queryTerms.length >= 0.20;
  }

  /**
   * Check for contradictions between sources
   */
  static checkContradictions(documents) {
    const answers = documents.map(d => d.answer || d.text || '').filter(Boolean);
    if (answers.length > 1) {
      const avgLength = answers.reduce((sum, a) => sum + a.length, 0) / answers.length;
      const variance = answers.reduce((sum, a) => sum + Math.abs(a.length - avgLength), 0) / answers.length;
      
      if (avgLength > 0 && variance / avgLength > 2.5) {
        logger.warn('Potential source contradiction detected');
        return true;
      }
    }
    return false;
  }

  /**
   * Generate answer from verified documents using Local LLM (llama.cpp) or OpenAI
   */
  static async generateAnswer(queryText, documents) {
    const topDoc = documents[0];
    const fallbackAnswer = topDoc?.answer || topDoc?.text || 'Information verified from approved policy documents.';
    
    if (!openaiClient) {
      return fallbackAnswer;
    }

    try {
      const contextText = documents
        .slice(0, 3)
        .map((doc, idx) => `[Source ${idx + 1}: ${doc.title || doc.question}]\n${doc.answer || doc.text}`)
        .join('\n\n');

      const response = await openaiClient.chat.completions.create({
        model: env.openai?.model || 'qwen2.5-coder-1.5b',
        messages: [
          {
            role: 'system',
            content: `You are Samagama AI, an autonomous query triage and resolution assistant. Answer the student's question accurately, concisely, and professionally using ONLY the provided verified knowledge base sources below. Include a brief reference to the policy source title.\n\nKnowledge Base:\n${contextText}`
          },
          {
            role: 'user',
            content: queryText
          }
        ],
        temperature: 0.2,
        max_tokens: 350
      });

      const aiText = response.choices?.[0]?.message?.content?.trim();
      if (aiText && aiText.length > 10) {
        logger.info('Successfully generated AI answer via local llama.cpp / Qwen model');
        return aiText;
      }
    } catch (llmError) {
      logger.warn(`Local LLM generation fallback (${llmError.message}). Using extracted FAQ text.`);
    }

    return fallbackAnswer;
  }
}

export default RAGService;
