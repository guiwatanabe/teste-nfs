import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import fastifyJwt from '@fastify/jwt';

export function setupJwtHandler(app: FastifyInstance) {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined.');
  }

  app.register(fastifyJwt, {
    secret: process.env.JWT_SECRET,
    cookie: {
      cookieName: 'authToken',
      signed: false,
    },
    sign: {
      expiresIn: process.env.TOKEN_DURATION ? Number(process.env.TOKEN_DURATION) : 3600,
    },
  });

  app.decorate('authenticate', async function (request: FastifyRequest, response: FastifyReply) {
    try {
      const token = request.cookies.authToken;

      if (!token) {
        response.status(401).send({ message: 'Unauthorized' });
        return;
      }

      const decoded = await request.jwtVerify({ onlyCookie: true });
      request.user = decoded;
    } catch (err) {
      response.status(401).send({ message: 'Unauthorized' });
    }
  });
}
