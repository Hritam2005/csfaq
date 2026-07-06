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


import fs from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const parsedFaqs = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'parsed_faqs_final.json'), 'utf8')
);

const faqsData = parsedFaqs.map(faq => {
  const wordCount = faq.answer.split(/\s+/).length;
  let difficultyLevel = 'beginner';
  if (wordCount > 250) difficultyLevel = 'advanced';
  else if (wordCount > 100) difficultyLevel = 'intermediate';

  const estimatedReadingTime = Math.ceil(wordCount / 200);

  return {
    categoryName: faq.categoryName,
    question: faq.question,
    answer: faq.answer,
    difficultyLevel,
    estimatedReadingTime
  };
});

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
        helpfulCount: Math.floor(Math.random() * 100), // Random helpful votes
        unhelpfulCount: Math.floor(Math.random() * 15), // Random unhelpful votes
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
