import { Router } from 'express';
import { logger } from './logger.js';

// Setup Mock BullBoard Router since we aren't using BullMQ anymore
export const bullBoardRouter = Router();

// Memory-based Job Queue Implementation to bypass Redis requirement
class MemoryQueue {
  constructor(name) {
    this.name = name;
    this.jobs = [];
    this.workers = [];
    this.jobCounter = 0;
  }
  
  async add(name, data, options = {}) {
    this.jobCounter++;
    const job = { 
      id: this.jobCounter.toString(), 
      name, 
      data, 
      attempts: 0, 
      opts: options 
    };
    this.jobs.push(job);
    logger.info(`📥 Added job ${job.id} to ${this.name} queue`);
    this._processNext();
    return job;
  }
  
  registerWorker(concurrency, handler) {
    this.workers.push({ handler, concurrency, active: 0 });
    this._processNext();
  }
  
  async _processNext() {
    if (this.jobs.length === 0) return;
    
    for (let worker of this.workers) {
      while (worker.active < worker.concurrency && this.jobs.length > 0) {
        worker.active++;
        const job = this.jobs.shift();
        
        // Execute asynchronously
        setTimeout(async () => {
          try {
            await worker.handler(job);
            logger.info(`✅ Job ${job.id} completed in ${this.name}`);
          } catch (err) {
            logger.error(`❌ Job ${job.id} failed in ${this.name}:`, err);
          } finally {
            worker.active--;
            this._processNext();
          }
        }, 0);
      }
    }
  }
}

const memoryQueues = new Map();

/**
 * Creates an in-memory queue mimicking BullMQ
 */
export const createQueue = (queueName) => {
  if (!memoryQueues.has(queueName)) {
    memoryQueues.set(queueName, new MemoryQueue(queueName));
  }
  return memoryQueues.get(queueName);
};

/**
 * Creates an in-memory worker mimicking BullMQ
 */
export const createWorker = (queueName, processor, concurrency = 1) => {
  const queue = createQueue(queueName);
  queue.registerWorker(concurrency, processor);
  return {
    on: () => {} // Mock event listener used by BullMQ workers
  };
};

logger.info('✅ Using In-Memory Queue (Redis completely bypassed)');
