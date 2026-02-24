import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

vi.unmock('../../src/db/connection');

import { getDbConnection } from '../../src/db/connection';

const envVars = [
  'DATABASE_USER',
  'DATABASE_PASSWORD',
  'DATABASE_HOST',
  'DATABASE_PORT',
  'DATABASE_NAME',
];

describe('getDbConnection', () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = { ...originalEnv };
    vi.restoreAllMocks();
  });

  it('throws error if any env var is missing', () => {
    envVars.forEach(key => {
      const saved = process.env[key];
      delete process.env[key];
      expect(() => getDbConnection()).toThrow('Database environment variables must be set');
      process.env[key] = saved;
    });
  });
});
