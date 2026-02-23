import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import fastifyJwt from '@fastify/jwt';

export function setupJwtHandler(app: FastifyInstance) {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined.');
  }

  app.register(fastifyJwt, {
    secret: process.env.JWT_SECRET,
    sign: {
      expiresIn: '30m',
    },
  });

  app.decorate('authenticate', async function (request: FastifyRequest, response: FastifyReply) {
    try {
      await request.jwtVerify();
    } catch (err) {
      response.status(401).send({ message: 'Unauthorized' });
    }
  });
}
