import fs from 'fs';

const text = fs.readFileSync('./temp_faq_text.txt', 'utf8');
const lines = text.split('\n');

// Find all matches for "1.1", "1.2", etc.
const qRegex = /^(\d+\.\d+)\s+(.+)$/;

for (let i = 0; i < lines.length; i++) {
  const match = lines[i].trim().match(qRegex);
  if (match) {
    const qNum = match[1];
    const qText = match[2];
    
    // Only print occurrences that are in the main body (after line 200)
    if (i > 200) {
      console.log(`\n--- Line ${i}: Question ${qNum}: ${qText} ---`);
      console.log('BEFORE:');
      console.log(lines.slice(Math.max(200, i - 8), i).join('\n'));
      console.log('AFTER:');
      console.log(lines.slice(i + 1, Math.min(lines.length, i + 8)).join('\n'));
    }
  }
}
