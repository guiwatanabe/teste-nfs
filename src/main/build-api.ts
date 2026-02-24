import Fastify, { type FastifyReply, type FastifyRequest } from 'fastify';
import fastifyFormbody from '@fastify/formbody';
import fastifyMultipart from '@fastify/multipart';
import fastifyCors from '@fastify/cors';
import fastifyCookie from '@fastify/cookie';
import { registerUserRoutes } from '../modules/users/user.controller.js';
import { registerSaleRoutes } from '../modules/sales/sale.controller.js';
import { registerCertificateRoutes } from '../modules/certificates/certificate.controller.js';
import { registerWebhookRoute } from '../modules/webhook/webhook.controller.js';
import { setupErrorHandler } from '../middleware/error-handler.js';
import { setupJwtHandler } from '../middleware/jwt-handler.js';
import createPaths from '../util/create-paths.js';

const APP_ENV = process.env.ENVIRONMENT ?? 'development';

export async function buildApi() {
  if (!process.env.APP_KEY) {
    throw new Error('APP_KEY is not defined.');
  }

  await createPaths();

  const logLevel = APP_ENV === 'test' ? 'silent' : APP_ENV === 'development' ? 'debug' : 'info';

  const app = Fastify({
    logger: {
      level: logLevel,
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
    origin: [
      process.env.VITE_URL ?? `http://localhost:${process.env.FRONTEND_PORT ?? 4173}`,
      'http://localhost:4173',
      'http://localhost:5173',
    ].filter(Boolean),
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

  app.get('/health', async (_request: FastifyRequest, _response: FastifyReply) => {
    return { status: 'ok' };
  });

  return app;
}
