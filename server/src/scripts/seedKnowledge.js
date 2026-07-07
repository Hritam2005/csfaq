import { connectDB } from '../config/db.js';
import User from '../models/User.js';
import Category from '../models/Category.js';
import FAQ from '../models/FAQ.js';
import { APPROVAL_STATUS, VISIBILITY } from '../constants/knowledge.constants.js';

const categories = [
  {
    name: 'Application Process',
    description: 'How to apply, deadlines, and selection steps for the Vicharanashala internship.',
    color: '#2563eb',
    icon: 'file-text',
    order: 1,
  },
  {
    name: 'Eligibility & Requirements',
    description: 'Who can apply and what documents or skills are needed.',
    color: '#7c3aed',
    icon: 'check-circle',
    order: 2,
  },
  {
    name: 'Program Details',
    description: 'Duration, structure, mentorship, and learning outcomes.',
    color: '#059669',
    icon: 'book-open',
    order: 3,
  },
  {
    name: 'Support & Contact',
    description: 'Getting help, contacting the team, and troubleshooting.',
    color: '#ea580c',
    icon: 'life-buoy',
    order: 4,
  },
];

const faqsByCategory = {
  'Application Process': [
    {
      question: 'How do I apply for the Vicharanashala internship?',
      summary: 'Step-by-step guide to submitting your internship application.',
      answer: `### Application Steps

1. **Create an account** on the Vicharanashala portal and complete your profile.
2. **Prepare your documents** — resume, statement of purpose, and any required academic records.
3. **Submit the application form** before the published deadline.
4. **Track your status** from your dashboard after submission.

Applications are reviewed on a rolling basis. You will receive an email once your application moves to the next stage.`,
      keywords: ['apply', 'application', 'internship', 'submit', 'register'],
    },
    {
      question: 'What is the internship application deadline?',
      summary: 'Key dates and timeline for the current cohort.',
      answer: `### Deadlines

- **Application opens:** Announced on the homepage timeline
- **Application closes:** Check the official timeline section for the current cohort date
- **Review period:** 2–3 weeks after the deadline
- **Offer letters:** Sent via registered email

We recommend applying at least one week before the deadline to avoid last-minute issues with document uploads.`,
      keywords: ['deadline', 'timeline', 'dates', 'last date'],
    },
    {
      question: 'How long does the selection process take?',
      summary: 'Typical review and interview timeline after you apply.',
      answer: `After you submit your application, the review team typically responds within **2–3 weeks**.

The process may include:
- Initial application screening
- Short assignment or questionnaire (if applicable)
- Interview round with the program team

You can check updates in your dashboard and via email notifications.`,
      keywords: ['selection', 'review', 'interview', 'how long'],
    },
  ],
  'Eligibility & Requirements': [
    {
      question: 'What is the eligibility criteria for the internship?',
      summary: 'Who can apply and basic qualification requirements.',
      answer: `### Eligibility

Applicants should generally meet the following criteria:

- Interest in research, learning, and structured self-study
- Ability to commit to the full program duration
- Basic communication skills in English
- Willingness to participate in mentorship sessions and assignments

Specific cohort requirements may vary — always check the latest announcement on the homepage.`,
      keywords: ['eligibility', 'criteria', 'qualification', 'who can apply'],
    },
    {
      question: 'What documents are required for the application?',
      summary: 'List of documents to prepare before applying.',
      answer: `### Required Documents

- Updated **resume/CV**
- **Statement of purpose** (500–800 words recommended)
- Academic records or proof of current enrollment (if applicable)
- Valid **email address** and phone number for communication

Optional but helpful:
- Portfolio links or project samples
- Recommendation letter (if available)`,
      keywords: ['documents', 'resume', 'cv', 'requirements', 'sop'],
    },
    {
      question: 'Can students from any background apply?',
      summary: 'Openness to diverse academic and professional backgrounds.',
      answer: `Yes. Vicharanashala welcomes applicants from **diverse academic and professional backgrounds**.

The program values curiosity, commitment, and the ability to learn independently more than a specific degree. If your background is unconventional, use your statement of purpose to explain how you will benefit from and contribute to the cohort.`,
      keywords: ['background', 'students', 'degree', 'qualification'],
    },
  ],
  'Program Details': [
    {
      question: 'What will I learn during the internship?',
      summary: 'Overview of skills, topics, and learning approach.',
      answer: `### Program Focus

The internship is designed around **structured exploration and research skills**, including:

- How to frame good questions and investigate topics deeply
- Reading, note-taking, and synthesis from multiple sources
- Writing and presenting your findings clearly
- Working with mentors and peers in a collaborative environment

Exact modules may vary by cohort. See the homepage timeline for the current syllabus overview.`,
      keywords: ['learn', 'curriculum', 'skills', 'program', 'syllabus'],
    },
    {
      question: 'Is the internship remote or in-person?',
      summary: 'Format and attendance expectations.',
      answer: `The program is primarily **remote-friendly**, with live online sessions for mentorship, discussions, and reviews.

Some cohorts may include optional in-person meetups or events depending on location and schedule. Participation requirements for live sessions will be shared in your offer letter.`,
      keywords: ['remote', 'online', 'in-person', 'hybrid', 'location'],
    },
    {
      question: 'Will I receive a certificate after completion?',
      summary: 'Certificate and completion requirements.',
      answer: `Yes. Interns who **successfully complete** the program requirements receive a **certificate of completion** from Vicharanashala.

Completion typically requires:
- Attending required mentorship sessions
- Submitting assigned work on time
- Participating in final presentation or review

Certificate details are shared at the start of each cohort.`,
      keywords: ['certificate', 'completion', 'credential'],
    },
  ],
  'Support & Contact': [
    {
      question: 'How do I contact the Vicharanashala support team?',
      summary: 'Ways to reach the team for help.',
      answer: `### Contact Options

- **Support page:** Submit your question via the [Support form](/support) if it is not covered in the knowledge base
- **Email:** Use the contact email listed on the Contact page
- **Yaksha AI:** Ask Yaksha for quick answers from the official FAQ knowledge base

For application-specific issues, include your registered email and application ID if available.`,
      keywords: ['contact', 'support', 'help', 'email'],
    },
    {
      question: 'I forgot my password. How do I reset it?',
      summary: 'Account recovery steps.',
      answer: `1. Go to the **Forgot Password** page from the login screen.
2. Enter your registered email address.
3. Check your inbox for a reset link (also check spam/junk).
4. Follow the link to set a new password.

If you do not receive the email within 10 minutes, contact support with your registered email address.`,
      keywords: ['password', 'reset', 'login', 'account'],
    },
    {
      question: 'Can Yaksha answer questions not in the FAQ?',
      summary: 'What Yaksha can and cannot help with.',
      answer: `Yaksha is trained to answer questions using the **official knowledge base** — FAQs, program documents, and approved content.

If your question is not covered:
- Yaksha may give a general guidance response with lower confidence
- Use the **Support page** to submit unknown questions to the admin team
- An admin will review and may add new FAQ articles for future applicants`,
      keywords: ['yaksha', 'ai', 'chatbot', 'unknown questions'],
    },
  ],
};

connectDB().then(async () => {
  try {
    const admin = await User.findOne({ email: 'admin@example.com' });
    if (!admin) {
      console.error('Admin user not found. Run seed_admin.js first.');
      process.exit(1);
    }

    const categoryMap = {};
    for (const cat of categories) {
      let category = await Category.findOne({ name: cat.name });
      if (!category) {
        category = await Category.create(cat);
        console.log(`Created category: ${cat.name}`);
      } else {
        console.log(`Category exists: ${cat.name}`);
      }
      categoryMap[cat.name] = category._id;
    }

    let created = 0;
    let skipped = 0;

    for (const [categoryName, faqList] of Object.entries(faqsByCategory)) {
      for (const faqData of faqList) {
        const exists = await FAQ.findOne({ question: faqData.question, isDeleted: false });
        if (exists) {
          skipped++;
          continue;
        }

        await FAQ.create({
          ...faqData,
          category: categoryMap[categoryName],
          createdBy: admin._id,
          approvalStatus: APPROVAL_STATUS.APPROVED,
          visibility: VISIBILITY.PUBLIC,
          publishedAt: new Date(),
          popularityScore: Math.floor(Math.random() * 50) + 10,
          helpfulCount: Math.floor(Math.random() * 20),
        });
        created++;
      }
    }

    console.log(`Knowledge base seed complete. Created ${created} FAQs, skipped ${skipped} existing.`);
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
});
