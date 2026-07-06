import fs from 'fs';

const text = fs.readFileSync('./temp_faq_text.txt', 'utf8');

const startBodyIdx = text.indexOf('Vicharanashala Internship — FAQ\nVersion: v24.4.0');
const bodyText = text.substring(startBodyIdx);
const pages = bodyText.split(/-- \d+ of \d+ --/);

const parsedFaqs = [];
const questionQueue = [];

for (let pIdx = 0; pIdx < pages.length; pIdx++) {
  const pageText = pages[pIdx];
  const pageNum = pIdx + 6;
  
  // Clean page text
  let cleanText = pageText;
  const garbage = [
    /Vicharanashala Internship — FAQ/gi,
    /Version: v24\.4\.0 Last updated: 2026-06-09, IST/gi,
    /Vicharanashala Lab · Indian Institute of Technology Ropar · 2026 cycle/gi,
    /Questions: log in at samagama.in and ask Yaksha\./gi,
    /Welcome. This page covers the questions we hear most often. If something here is/gi,
    /unclear, or your case is genuinely different, log in to your dashboard and ask us in the/gi,
    /chat — we read every message\./gi,
    /Expand all Collapse all\tSearch the FAQ — type a keyword.*/gi,
    /Overview FAQ Voice.*/gi,
    /Applied AI · Open-source software engineering · IIT Ropar/gi
  ];
  for (const g of garbage) {
    cleanText = cleanText.replace(g, '');
  }
  
  const lines = cleanText.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  
  const pageQuestions = [];
  const pageAnswers = [];
  
  let currentQ = null;
  let currentA = '';
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Skip category headers
    const catMatch = line.match(/^(\d+)\.\s+(.+)$/);
    if (catMatch && !line.match(/^\d+\.\d+/)) {
      if (currentA) {
        pageAnswers.push(currentA.trim());
        currentA = '';
      }
      continue;
    }
    
    // Check if line is a question
    const qMatch = line.match(/^(\d+\.\d+)\s+(.+)$/);
    if (qMatch) {
      if (currentA) {
        pageAnswers.push(currentA.trim());
        currentA = '';
      }
      
      const num = qMatch[1];
      let qText = qMatch[2];
      
      let j = i + 1;
      while (j < lines.length && lines[j] !== '▸' && !lines[j].match(/^\d+\.\d+/)) {
        qText += ' ' + lines[j];
        j++;
      }
      
      pageQuestions.push({
        num,
        question: qText.replace(/\s+/g, ' ').replace(/▸/g, '').trim()
      });
      i = j; // skip forward
    } else if (line === '▸') {
      if (currentA) {
        pageAnswers.push(currentA.trim());
        currentA = '';
      }
    } else {
      // It's part of an answer
      // Determine if this line should start a new answer block
      // A line starts a new answer block if:
      // 1. currentA is empty
      // 2. The line starts with a capital letter/number/symbol AND the previous line ended with a sentence terminator (. or ? or ! or :)
      const isSentenceStart = currentA.length > 0 && 
                              line.match(/^[A-Z0-9🥉🥈🥇🏆⚠📌>]/) && 
                              currentA.trim().match(/[.?!:"]$/);
                              
      if (isSentenceStart) {
        pageAnswers.push(currentA.trim());
        currentA = line;
      } else {
        currentA += ' ' + line;
      }
    }
  }
  
  if (currentA) {
    pageAnswers.push(currentA.trim());
  }
  
  // Clean answer blocks
  const cleanPageAnswers = pageAnswers
    .map(a => a.replace(/\s+/g, ' ').trim())
    .filter(a => a.length > 15 && !a.startsWith('CONTENTS'));
    
  console.log(`Page ${pageNum}: Found ${pageQuestions.length} Qs, ${cleanPageAnswers.length} As`);
  
  // Enqueue questions
  for (const q of pageQuestions) {
    questionQueue.push(q);
  }
  
  // Match
  const matchCount = Math.min(questionQueue.length, cleanPageAnswers.length);
  for (let i = 0; i < matchCount; i++) {
    const q = questionQueue.shift();
    const a = cleanPageAnswers[i];
    parsedFaqs.push({
      num: q.num,
      question: q.question,
      answer: a
    });
  }
}

console.log(`\nSuccessfully mapped ${parsedFaqs.length} FAQs.`);
console.log(`Leftover questions in queue: ${questionQueue.length}`);
if (questionQueue.length > 0) {
  console.log('Sample leftover questions:');
  for (let i = 0; i < Math.min(5, questionQueue.length); i++) {
    console.log(`  - ${questionQueue[i].num}: ${questionQueue[i].question}`);
  }
}
