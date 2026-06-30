import { createQueue, createWorker } from '../../../config/queue.js';
import { documentEvents } from '../Document.events.js';
import { DOCUMENT_EVENTS } from '../Document.constants.js';

class QueueWrapper {
  constructor() {
    this.queues = new Map();
    this.workers = new Map();
  }

  process(name, concurrency, handler) {
    if (!this.queues.has(name)) {
      this.queues.set(name, createQueue(name));
    }
    if (!this.workers.has(name)) {
      const worker = createWorker(name, async (job) => {
        try {
          await handler(job);
        } catch (error) {
          documentEvents.emit(DOCUMENT_EVENTS.ERROR, { job, error });
          throw error; // Re-throw so BullMQ records the failure
        }
      }, concurrency);
      this.workers.set(name, worker);
    }
  }

  async add(name, data, options = {}) {
    let queue = this.queues.get(name);
    if (!queue) {
      queue = createQueue(name);
      this.queues.set(name, queue);
    }
    
    // BullMQ expects attempts -> attempts
    const jobOptions = {
      attempts: options.attempts || 3,
      backoff: {
        type: 'exponential',
        delay: 1000,
      },
      ...options
    };
    
    return await queue.add(name, data, jobOptions);
  }
}

export const QueueService = new QueueWrapper();

