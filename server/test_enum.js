import KnowledgeDocument from './src/models/KnowledgeDocument.js';
console.log(KnowledgeDocument.schema.path('status').enumValues);
process.exit(0);
