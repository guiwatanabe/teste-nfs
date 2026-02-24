import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { setupErrorHandler } from '../../src/middleware/error-handler';

const createMockApp = () => {
  return {
    setErrorHandler: vi.fn(),
  };
};

describe('setupErrorHandler', () => {
  const originalEnv = process.env.ENVIRONMENT;

  afterEach(() => {
    process.env.ENVIRONMENT = originalEnv;
    vi.restoreAllMocks();
  });

  it('throws if ENVIRONMENT is not defined', () => {
    const originalEnv = process.env.ENVIRONMENT;
    delete process.env.ENVIRONMENT;
    const app = createMockApp();
    let thrown: unknown;
    try {
      setupErrorHandler(app as any);
    } catch (e: unknown) {
      thrown = e;
    }
    expect(thrown).toBeDefined();
    expect((thrown as Error).message).toBe('ENVIRONMENT variable is not defined.');
    process.env.ENVIRONMENT = originalEnv;
  });

  it('sets error handler for validation errors in development', () => {
    process.env.ENVIRONMENT = 'development';
    const app = createMockApp();
    setupErrorHandler(app as any);
    const handler = app.setErrorHandler.mock.calls[0][0];
    const error = { validation: [{ field: 'name' }] };
    const request = { log: { error: vi.fn() } };
    const sendMock = vi.fn();
    const statusMock = vi.fn(() => ({ send: sendMock }));
    const response = { status: statusMock };
    handler(error, request as any, response as any);
    expect(statusMock).toHaveBeenCalledWith(422);
    expect(sendMock).toHaveBeenCalledWith({
      message: 'Validation failed.',
      errors: error.validation,
    });
  });

  it('sets error handler for validation errors in production', () => {
    process.env.ENVIRONMENT = 'production';
    const app = createMockApp();
    setupErrorHandler(app as any);
    const handler = app.setErrorHandler.mock.calls[0][0];
    const error = { validation: [{ field: 'name' }] };
    const request = { log: { error: vi.fn() } };
    const sendMock = vi.fn();
    const statusMock = vi.fn(() => ({ send: sendMock }));
    const response = { status: statusMock };
    handler(error, request as any, response as any);
    expect(statusMock).toHaveBeenCalledWith(422);
    expect(sendMock).toHaveBeenCalledWith({
      message: 'Validation failed.',
    });
  });

  it('sets error handler for generic errors in development', () => {
    process.env.ENVIRONMENT = 'development';
    const app = createMockApp();
    setupErrorHandler(app as any);
    const handler = app.setErrorHandler.mock.calls[0][0];
    const error = { statusCode: 400, message: 'Bad Request' };
    const request = { log: { error: vi.fn() } };
    const sendMock = vi.fn();
    const statusMock = vi.fn(() => ({ send: sendMock }));
    const response = { status: statusMock };
    handler(error, request as any, response as any);
    expect(statusMock).toHaveBeenCalledWith(400);
    expect(sendMock).toHaveBeenCalledWith({
      message: 'Bad Request',
    });
  });

  it('sets error handler for generic errors in production', () => {
    process.env.ENVIRONMENT = 'production';
    const app = createMockApp();
    setupErrorHandler(app as any);
    const handler = app.setErrorHandler.mock.calls[0][0];
    const error = { statusCode: 400, message: 'Bad Request' };
    const request = { log: { error: vi.fn() } };
    const sendMock = vi.fn();
    const statusMock = vi.fn(() => ({ send: sendMock }));
    const response = { status: statusMock };
    handler(error, request as any, response as any);
    expect(statusMock).toHaveBeenCalledWith(400);
    expect(sendMock).toHaveBeenCalledWith({
      message: 'Internal Server Error',
    });
  });
});
