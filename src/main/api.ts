import 'dotenv/config';
import { buildApi } from './build-api.js';

const APP_ENV = process.env.ENVIRONMENT ?? 'development';
const APP_HOST = process.env.HOST ?? '0.0.0.0';
const APP_PORT = Number(process.env.API_PORT ?? 3000);

try {
  const app = await buildApi();
  await app.listen({ host: APP_HOST, port: APP_PORT });
  app.log.info(`Server listening at http://${APP_HOST}:${APP_PORT} - ENVIRONMENT: ${APP_ENV}`);
} catch (err) {
  console.error(err);
  process.exit(1);
}
