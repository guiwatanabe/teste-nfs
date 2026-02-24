import type { FastifyInstance, FastifyReply, FastifyRequest, onRequestHookHandler } from 'fastify';
import { compare } from 'bcryptjs';
import { findUserById, findUserByUsername } from './user.service.js';
import authLoginSchema from './user.schema.js';
import type { User } from './user.model.js';

export async function registerUserRoutes(app: FastifyInstance) {
  app.route({
    method: 'GET',
    url: '/auth/user',
    onRequest: [app.getDecorator('authenticate') as onRequestHookHandler],
    handler: async (request: FastifyRequest, response: FastifyReply) => {
      const user = request.user as User;
      const foundUser = await findUserById(user.id!);
      if (!foundUser) {
        response.status(404).send({ message: 'User not found.' });
        return;
      }

      response.send({ ...foundUser, password_hash: undefined });
    },
  });

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

      response.setCookie('authToken', token, {
        path: '/',
        httpOnly: true,
        secure: process.env.ENVIRONMENT === 'production',
        sameSite: 'lax',
        maxAge: process.env.TOKEN_DURATION ? Number(process.env.TOKEN_DURATION) : 3600,
      });

      response.send({ message: 'Login successful.', token });
    },
  });

  app.route({
    method: 'POST',
    url: '/auth/logout',
    handler: async (_request: FastifyRequest, response: FastifyReply) => {
      response.clearCookie('authToken', {
        path: '/',
        httpOnly: true,
        secure: process.env.ENVIRONMENT === 'production',
        sameSite: 'lax',
      });

      response.send({ message: 'Logout successful.' });
    },
  });
}
