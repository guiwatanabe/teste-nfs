import 'dotenv/config';
import { buildPrefeituraMock } from './build-prefeitura-mock.js';

const APP_HOST = process.env.HOST ?? '0.0.0.0';
const APP_PORT = Number(process.env.MOCK_PORT ?? 3001);

const app = buildPrefeituraMock();

app.listen({ host: APP_HOST, port: APP_PORT }, (err: Error | null, address: string) => {
  if (err) {
    app.log.error(err);
    process.exit(1);
  }
  app.log.info(`Server listening at ${address}`);
});
