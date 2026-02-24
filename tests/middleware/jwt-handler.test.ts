import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { setupJwtHandler } from '../../src/middleware/jwt-handler';

const createMockApp = () => {
  return {
    register: vi.fn(),
    decorate: vi.fn(),
  };
};

describe('setupJwtHandler', () => {
  const originalJwtSecret = process.env.JWT_SECRET;
  const originalTokenDuration = process.env.TOKEN_DURATION;

  afterEach(() => {
    process.env.JWT_SECRET = originalJwtSecret;
    process.env.TOKEN_DURATION = originalTokenDuration;
    vi.restoreAllMocks();
  });

  it('throws if JWT_SECRET is not defined', () => {
    delete process.env.JWT_SECRET;
    const app = createMockApp();
    let thrown: unknown;
    try {
      setupJwtHandler(app as any);
    } catch (e: unknown) {
      thrown = e;
    }
    expect(thrown).toBeDefined();
    expect((thrown as Error).message).toBe('JWT_SECRET is not defined.');
  });

  it('registers fastifyJwt with correct options', () => {
    process.env.JWT_SECRET = 'testsecret';
    process.env.TOKEN_DURATION = '7200';
    const app = createMockApp();
    setupJwtHandler(app as any);
    expect(app.register).toHaveBeenCalledWith(expect.any(Function), {
      secret: 'testsecret',
      cookie: {
        cookieName: 'authToken',
        signed: false,
      },
      sign: {
        expiresIn: 7200,
      },
    });
  });

  it('registers fastifyJwt with default expiresIn if TOKEN_DURATION is not set', () => {
    process.env.JWT_SECRET = 'testsecret';
    delete process.env.TOKEN_DURATION;
    const app = createMockApp();
    setupJwtHandler(app as any);
    expect(app.register).toHaveBeenCalledWith(expect.any(Function), {
      secret: 'testsecret',
      cookie: {
        cookieName: 'authToken',
        signed: false,
      },
      sign: {
        expiresIn: 3600,
      },
    });
  });

  it('decorates authenticate handler', () => {
    process.env.JWT_SECRET = 'testsecret';
    const app = createMockApp();
    setupJwtHandler(app as any);
    expect(app.decorate).toHaveBeenCalledWith('authenticate', expect.any(Function));
  });
});
