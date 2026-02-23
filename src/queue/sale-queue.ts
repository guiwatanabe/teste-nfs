import 'dotenv/config';
import { Queue } from 'bullmq';

if (!process.env.REDIS_HOST) {
  throw new Error('REDIS_HOST environment variable must be set');
}

export const saleQueue = new Queue('sale-processing', {
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 5000,
    },
    removeOnComplete: true,
    removeOnFail: false,
  },
  connection: {
    host: process.env.REDIS_HOST,
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD || '',
  },
});
