import 'dotenv/config';
import { buildWorker } from './build-worker.js';

const worker = buildWorker();

worker.on('error', err => {
  console.error('[Worker] Error:', err);
});
