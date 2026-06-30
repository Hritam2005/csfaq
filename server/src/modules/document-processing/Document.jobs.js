import { QueueService } from './queue/QueueService.js';
import { DocumentProcessor } from './processing/DocumentProcessor.js';

export function initializeDocumentJobs() {
  // Register the background job handler
  QueueService.process('document-process', 2, async (job) => {
    console.log(`[Queue] Processing job: ${job.name} (Attempt ${job.attempts + 1})`);
    await DocumentProcessor.processJob(job.data);
    console.log(`[Queue] Job complete: ${job.name}`);
  });
}
