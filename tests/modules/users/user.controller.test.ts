import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import { buildApi } from '../../../src/main/build-api';
import type { FastifyInstance } from 'fastify';
import { findUserById, findUserByUsername } from '../../../src/modules/users/user.service';

vi.mock('../../../src/modules/users/user.service', () => ({
  findUserById: vi.fn().mockResolvedValue(null),
  findUserByUsername: vi.fn().mockResolvedValue(null),
  createUser: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('bcryptjs', () => ({
  compare: vi.fn().mockResolvedValue(false),
  hash: vi.fn().mockResolvedValue('hashed'),
}));

import { compare } from 'bcryptjs';

const mockUser = {
  id: 1,
  identification: 'Test User',
  cpf_cnpj: '12345678000190',
  municipal_state_registration: null,
  address: '123 Test St',
  address_number: null,
  address_complement: null,
  address_neighborhood: null,
  address_municipal_code: '3550308',
  address_city: 'São Paulo',
  address_state: 'SP',
  address_zip_code: '01310-100',
  phone_number: '11999999999',
  email: 'test@test.com',
  username: 'testuser',
  password_hash: '$2b$10$hashedpassword',
};

describe('user.controller', () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = await buildApi();
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /auth/user', () => {
    it('returns 401 without token', async () => {
      const response = await app.inject({ method: 'GET', url: '/auth/user' });
      expect(response.statusCode).toBe(401);
    });

    it('returns 404 when user is not found', async () => {
      vi.mocked(findUserById).mockResolvedValueOnce(null);
      const token = app.jwt.sign({ id: 99, username: 'ghost' });
      const response = await app.inject({
        method: 'GET',
        url: '/auth/user',
        cookies: { authToken: token },
      });
      expect(response.statusCode).toBe(404);
      expect(response.json()).toEqual({ message: 'User not found.' });
    });

    it('returns 200 with user data (without password_hash) when found', async () => {
      vi.mocked(findUserById).mockResolvedValueOnce(mockUser as any);
      const token = app.jwt.sign({ id: 1, username: 'testuser' });
      const response = await app.inject({
        method: 'GET',
        url: '/auth/user',
        cookies: { authToken: token },
      });
      expect(response.statusCode).toBe(200);
      const body = response.json();
      expect(body.username).toBe('testuser');
      expect(body.password_hash).toBeUndefined();
    });
  });

  describe('POST /auth/login', () => {
    it('returns 422 when body is missing required fields', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/auth/login',
        payload: { username: 'testuser' },
      });
      expect(response.statusCode).toBe(422);
    });

    it('returns 401 when user is not found', async () => {
      vi.mocked(findUserByUsername).mockResolvedValueOnce(null);
      const response = await app.inject({
        method: 'POST',
        url: '/auth/login',
        payload: { username: 'unknown', password: 'pass' },
      });
      expect(response.statusCode).toBe(401);
      expect(response.json()).toEqual({ message: 'Invalid username or password.' });
    });

    it('returns 401 when password is incorrect', async () => {
      vi.mocked(findUserByUsername).mockResolvedValueOnce(mockUser as any);
      vi.mocked(compare).mockResolvedValueOnce(false);
      const response = await app.inject({
        method: 'POST',
        url: '/auth/login',
        payload: { username: 'testuser', password: 'wrongpass' },
      });
      expect(response.statusCode).toBe(401);
      expect(response.json()).toEqual({ message: 'Invalid username or password.' });
    });

    it('returns 200 with token and sets authToken cookie on success', async () => {
      vi.mocked(findUserByUsername).mockResolvedValueOnce(mockUser as any);
      vi.mocked(compare).mockResolvedValueOnce(true);
      const response = await app.inject({
        method: 'POST',
        url: '/auth/login',
        payload: { username: 'testuser', password: 'correctpass' },
      });
      expect(response.statusCode).toBe(200);
      const body = response.json();
      expect(body.message).toBe('Login successful.');
      expect(typeof body.token).toBe('string');
      const setCookie = response.headers['set-cookie'];
      expect(setCookie).toBeDefined();
      expect(String(setCookie)).toContain('authToken=');
    });

    it('issues a JWT containing the user id and username', async () => {
      vi.mocked(findUserByUsername).mockResolvedValueOnce(mockUser as any);
      vi.mocked(compare).mockResolvedValueOnce(true);
      const response = await app.inject({
        method: 'POST',
        url: '/auth/login',
        payload: { username: 'testuser', password: 'correctpass' },
      });
      const { token } = response.json();
      const decoded = app.jwt.decode(token) as any;
      expect(decoded.id).toBe(1);
      expect(decoded.username).toBe('testuser');
    });
  });

  describe('POST /auth/logout', () => {
    it('returns 200 with logout message', async () => {
      const response = await app.inject({ method: 'POST', url: '/auth/logout' });
      expect(response.statusCode).toBe(200);
      expect(response.json()).toEqual({ message: 'Logout successful.' });
    });

    it('clears the authToken cookie', async () => {
      const response = await app.inject({ method: 'POST', url: '/auth/logout' });
      const setCookie = String(response.headers['set-cookie'] ?? '');
      expect(setCookie).toContain('authToken=');
      expect(setCookie).toContain('Max-Age=0');
    });
  });
});
