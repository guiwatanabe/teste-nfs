import 'dotenv/config';
import Fastify, { type FastifyReply, type FastifyRequest } from 'fastify';
import { registerUserRoutes } from '../modules/users/user.controller.js';
import { registerSaleRoutes } from '../modules/sales/sale.controller.js';
import fastifyFormbody from '@fastify/formbody';
import fastifyMultipart from '@fastify/multipart';
import { registerCertificateRoutes } from '../modules/certificates/certificate.controller.js';
import createPaths from '../util/create-paths.js';
import { setupErrorHandler } from '../middleware/error-handler.js';
import { setupJwtHandler } from '../middleware/jwt-handler.js';
import { registerWebhookRoute } from '../modules/webhook/webhook.controller.js';
import fastifyCors from '@fastify/cors';
import fastifyCookie from '@fastify/cookie';

const APP_ENV = process.env.ENVIRONMENT ?? 'development';
const APP_HOST = process.env.HOST ?? '0.0.0.0';
const APP_PORT = Number(process.env.API_PORT ?? 3000);

if (!process.env.APP_KEY) {
  throw new Error('APP_KEY is not defined.');
}

// create certificates folder
await createPaths();

const app = Fastify({
  logger: {
    level: APP_ENV === 'development' ? 'debug' : 'info',
    redact: [
      'req.headers.authorization',
      'req.body.password',
      'req.body.certificate_password',
      'req.body.cpf_cnpj',
      'req.body.email',
    ],
  },
});

app.register(fastifyFormbody);
app.register(fastifyMultipart);
app.register(fastifyCors, {
  origin:
    APP_ENV === 'development'
      ? (process.env.VITE_URL ?? 'http://localhost:5173')
      : (process.env.VITE_URL ?? 'http://localhost:80'),
  credentials: true,
});
app.register(fastifyCookie, { secret: process.env.APP_KEY });

// middleware
setupErrorHandler(app);
setupJwtHandler(app);

// routes
registerUserRoutes(app);
registerSaleRoutes(app);
registerCertificateRoutes(app);
registerWebhookRoute(app);

app.get('/health', async (request: FastifyRequest, response: FastifyReply) => {
  return { status: 'ok' };
});

try {
  await app.listen({ host: APP_HOST, port: APP_PORT });
  app.log.info(`Server listening at http://${APP_HOST}:${APP_PORT} - ENVIRONMENT: ${APP_ENV}`);
} catch (err) {
  app.log.error(err);
  process.exit(1);
}
