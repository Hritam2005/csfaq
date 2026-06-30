import { connectDB } from './src/config/db.js';
import KnowledgeDocument from './src/models/KnowledgeDocument.js';
import DocumentChunk from './src/models/DocumentChunk.js';

connectDB().then(async () => {
  await KnowledgeDocument.deleteMany({});
  await DocumentChunk.deleteMany({});
  console.log('Deleted all docs and chunks');
  process.exit(0);
});
