import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { buildApi } from '../../../src/main/build-api';
import type { FastifyInstance } from 'fastify';

describe('certificate.controller', () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = await buildApi();
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /certificate returns 401 without token', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/certificate',
    });
    expect(response.statusCode).toBe(401);
  });

  it('GET /certificate returns 404 with valid token but no certificate', async () => {
    const token = app.jwt.sign({ id: 1, email: 'test@test.com' });
    const response = await app.inject({
      method: 'GET',
      url: '/certificate',
      cookies: { authToken: token },
    });
    expect(response.statusCode).toBe(404);
    expect(response.json()).toEqual({ message: 'Certificate not found.' });
  });

  it('POST /certificate returns 401 without token', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/certificate',
    });
    expect(response.statusCode).toBe(401);
  });

  it('POST /certificate returns 400 with invalid file type', async () => {
    const token = app.jwt.sign({ id: 1, email: 'test@test.com' });

    const boundary = '----FormBoundary';
    const body = [
      `--${boundary}`,
      'Content-Disposition: form-data; name="file"; filename="invalid-file.txt"',
      'Content-Type: text/plain',
      '',
      'invalid-file-data',
      `--${boundary}`,
      'Content-Disposition: form-data; name="certificate_password"',
      '',
      'somepassword',
      `--${boundary}--`,
    ].join('\r\n');

    const response = await app.inject({
      method: 'POST',
      url: '/certificate',
      cookies: { authToken: token },
      headers: { 'content-type': `multipart/form-data; boundary=${boundary}` },
      payload: body,
    });
    expect(response.statusCode).toBe(400);
    expect(response.json()).toEqual({ message: 'Invalid file type. Only .pfx files are allowed.' });
  });

  it('POST /certificate returns 400 with missing file or password', async () => {
    const token = app.jwt.sign({ id: 1, email: 'test@test.com' });
    const response = await app.inject({
      method: 'POST',
      url: '/certificate',
      cookies: { authToken: token },
      headers: { 'content-type': 'multipart/form-data; boundary=----FormBoundary' },
      payload: `------FormBoundary\r\nContent-Disposition: form-data; name="certificate_password"\r\n\r\nsomepassword\r\n------FormBoundary--`,
    });
    expect(response.statusCode).toBe(400);
    expect(response.json()).toEqual({ message: 'Missing file or password.' });
  });
});
