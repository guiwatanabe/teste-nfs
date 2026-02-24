import { Worker } from 'bullmq';
import { saleQueue } from '../queue/sale-queue.js';
import { processSaleJob } from '../queue/jobs/process-sale.js';

export function buildWorker() {
  if (!process.env.REDIS_HOST) {
    throw new Error('REDIS_HOST environment variable must be set');
  }

  const worker = new Worker(
    saleQueue.name,
    async job => {
      const start = process.hrtime();
      await processSaleJob(job);
      const [sec, nano] = process.hrtime(start);
      const durationMs = Math.round(sec * 1000 + nano / 1e6);
      console.log(`[Worker] Job ${job.id} finished in ${durationMs}ms`);
    },
    {
      connection: {
        host: process.env.REDIS_HOST,
        port: parseInt(process.env.REDIS_PORT || '6379', 10),
        password: process.env.REDIS_PASSWORD || '',
      },
      lockDuration: 30000,
      stalledInterval: 30000,
      maxStalledCount: 2,
    }
  );

  return worker;
}
