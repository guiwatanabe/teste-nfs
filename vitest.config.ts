import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    setupFiles: ['./tests/setup.ts'],
    env: {
      ENVIRONMENT: 'test',
      JWT_SECRET: 'testsecret',
      TOKEN_DURATION: '3600',
      DATABASE_NAME: 'testdb',
      DATABASE_USER: 'testuser',
      DATABASE_PASSWORD: 'testpassword',
      DATABASE_HOST: 'localhost',
      DATABASE_PORT: '5432',
      APP_KEY: 'test-app-key',
      REDIS_HOST: 'localhost',
      REDIS_PORT: '6379',
    },
  },
});
