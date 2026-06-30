import { QueueService } from '../document-processing/queue/QueueService.js';
import { IndexBuilder } from './indexing/IndexBuilder.js';

export function initializeKnowledgeJobs() {
  // We hook into the document processing queue.
  // When a document finishes parsing and chunking, it queues an 'index' job.
  
  QueueService.process('knowledge-index', 3, async (job) => {
    const { documentId } = job.data;
    console.log(`[Knowledge Queue] Building vector index for document ${documentId}`);
    
    await IndexBuilder.buildIndexForDocument(documentId);
    
    console.log(`[Knowledge Queue] Indexing complete for document ${documentId}`);
  });
}
