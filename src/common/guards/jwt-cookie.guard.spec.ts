import { ConfigService } from '@nestjs/config';
import { UnauthorizedException } from '@nestjs/common';
import { ExecutionContext } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { JwtCookieGuard } from './jwt-cookie.guard';

type VerifyAsyncMock = jest.Mock<
  Promise<unknown>,
  [token: string, options?: { secret?: string }]
>;

type RequestWithCookies = {
  cookies: {
    accessToken?: string;
  };
  headers?: {
    authorization?: string;
  };
  user?: {
    userId: string;
    role: string;
  };
};

describe('JwtCookieGuard', () => {
  const jwt: { verifyAsync: VerifyAsyncMock } = {
    verifyAsync: jest.fn<Promise<unknown>, [string, { secret?: string }]>(),
  };

  const config: Pick<ConfigService, 'get'> = {
    get: jest.fn().mockReturnValue('test-secret'),
  };

  let guard: JwtCookieGuard;

  beforeEach(() => {
    jest.clearAllMocks();
    guard = new JwtCookieGuard(
      jwt as unknown as JwtService,
      config as unknown as ConfigService,
    );
  });

  it('rejects requests without an access token cookie', async () => {
    const request = { cookies: {} };

    await expect(
      guard.canActivate(createContext(request)),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('rejects requests with an invalid token', async () => {
    const request = { cookies: { accessToken: 'bad-token' } };
    jwt.verifyAsync.mockRejectedValue(new Error('invalid token'));

    await expect(
      guard.canActivate(createContext(request)),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('attaches userId and role from the JWT payload to the request', async () => {
    const request = { cookies: { accessToken: 'good-token' } };
    jwt.verifyAsync.mockResolvedValue({ sub: '42', role: 'admin' });

    await expect(guard.canActivate(createContext(request))).resolves.toBe(true);
    expect(request.user).toEqual({
      userId: '42',
      role: 'admin',
    });
  });

  it('accepts a bearer token when the access token cookie is missing', async () => {
    const request = {
      cookies: {},
      headers: { authorization: 'Bearer bearer-token' },
    };
    jwt.verifyAsync.mockResolvedValue({ sub: '7', role: 'school' });

    await expect(guard.canActivate(createContext(request))).resolves.toBe(true);
    expect(jwt.verifyAsync).toHaveBeenCalledWith('bearer-token', {
      secret: 'test-secret',
    });
    expect(request.user).toEqual({
      userId: '7',
      role: 'school',
    });
  });
});

function createContext(request: RequestWithCookies): ExecutionContext {
  return {
    getClass: () => JwtCookieGuard,
    getHandler: () => createContext,
    getArgs: () => [],
    getArgByIndex: () => undefined,
    switchToHttp: () => ({
      getRequest: <T = RequestWithCookies>() => request as unknown as T,
      getResponse: <T = unknown>() => ({}) as T,
      getNext: <T = unknown>() => ({}) as T,
    }),
    switchToRpc: () => ({
      getContext: <T = unknown>() => ({}) as T,
      getData: <T = unknown>() => ({}) as T,
    }),
    switchToWs: () => ({
      getClient: <T = unknown>() => ({}) as T,
      getData: <T = unknown>() => ({}) as T,
      getPattern: <T = unknown>() => ({}) as T,
    }),
    getType: <TContext extends string = 'http'>() => 'http' as TContext,
  };
}
