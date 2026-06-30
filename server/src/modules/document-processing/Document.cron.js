import cron from 'node-cron';
import KnowledgeDocument from '../../models/KnowledgeDocument.js';
import DocumentChunk from '../../models/DocumentChunk.js';
import { StorageFactory } from './storage/StorageFactory.js';
import { PROCESSING_STATUS } from './Document.constants.js';

export function initializeDocumentCronJobs() {
  // 1. Cleanup orphaned storage files (e.g., deleted docs where storage delete failed)
  // Runs every day at 2 AM
  cron.schedule('0 2 * * *', async () => {
    console.log('[CRON] Running Document Storage Cleanup...');
    try {
      const deletedDocs = await KnowledgeDocument.find({ isDeleted: true });
      const storage = StorageFactory.getProvider('local');
      
      for (const doc of deletedDocs) {
        try {
          await storage.delete(doc.storagePath);
          console.log(`[CRON] Cleaned up storage for doc: ${doc._id}`);
          // Permanently remove from DB after storage is clear
          await KnowledgeDocument.deleteOne({ _id: doc._id });
          await DocumentChunk.deleteMany({ document: doc._id });
        } catch (e) {
          console.error(`[CRON] Failed to delete storage for ${doc._id}`, e);
        }
      }
    } catch (error) {
      console.error('[CRON] Document Storage Cleanup failed', error);
    }
  });

  // 2. Retry stuck processing jobs (e.g. server crashed during processing)
  // Runs every hour
  cron.schedule('0 * * * *', async () => {
    console.log('[CRON] Running Stuck Processing Job Recovery...');
    try {
      const thirtyMinsAgo = new Date(Date.now() - 30 * 60 * 1000);
      
      // Find docs stuck in PROCESSING or CHUNKING for more than 30 minutes
      const stuckDocs = await KnowledgeDocument.find({
        status: { $in: [PROCESSING_STATUS.PROCESSING, PROCESSING_STATUS.CHUNKING] },
        updatedAt: { $lt: thirtyMinsAgo }
      });

      for (const doc of stuckDocs) {
        // Reset status so the UI shows it failed, user can hit retry
        doc.status = PROCESSING_STATUS.FAILED;
        await doc.save();
        console.log(`[CRON] Marked stuck document ${doc._id} as FAILED`);
      }
    } catch (error) {
      console.error('[CRON] Stuck Processing Recovery failed', error);
    }
  });
}
