import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { compare } from 'bcryptjs';
import { findUserByUsername } from './user.service.js';
import authLoginSchema from './user.schema.js';

export async function registerUserRoutes(app: FastifyInstance) {
  app.route({
    method: 'POST',
    url: '/auth/login',
    schema: { body: authLoginSchema },
    handler: async (request: FastifyRequest, response: FastifyReply) => {
      const { username, password } = request.body as { username: string; password: string };
      const user = await findUserByUsername(username);
      if (!user) {
        response.status(401).send({ message: 'Invalid username or password.' });
        return;
      }

      const isPasswordValid = await compare(password, user.password_hash);
      if (!isPasswordValid) {
        response.status(401).send({ message: 'Invalid username or password.' });
        return;
      }

      const token = app.jwt.sign({ id: user.id, username: user.username });
      response.send({ message: 'Login successful.', token });
    },
  });
}
