import { UnauthorizedException } from '@nestjs/common';
import { AuthController } from './auth.controller';

describe('AuthController', () => {
  const auth = {
    register: jest.fn(),
    login: jest.fn(),
    refresh: jest.fn(),
    forgotPassword: jest.fn(),
    resetPassword: jest.fn(),
  };

  let controller: AuthController;
  let response: { cookie: jest.Mock; clearCookie: jest.Mock };

  beforeEach(() => {
    jest.clearAllMocks();
    controller = new AuthController(auth as any);
    response = {
      cookie: jest.fn(),
      clearCookie: jest.fn(),
    };
  });

  it('returns 401 when the refresh token cookie is missing', async () => {
    await expect(
      controller.refresh({ cookies: {} } as any, response as any),
    ).rejects.toBeInstanceOf(UnauthorizedException);

    expect(response.clearCookie).toHaveBeenCalledTimes(2);
    expect(auth.refresh).not.toHaveBeenCalled();
  });

  it('returns 401 and clears cookies when the refresh token is invalid', async () => {
    auth.refresh.mockRejectedValue(
      new UnauthorizedException('Invalid refresh token'),
    );

    await expect(
      controller.refresh(
        { cookies: { refreshToken: 'bad-refresh-token' } } as any,
        response as any,
      ),
    ).rejects.toBeInstanceOf(UnauthorizedException);

    expect(response.clearCookie).toHaveBeenCalledTimes(2);
  });

  it('sets a new access cookie when the refresh token is valid', async () => {
    auth.refresh.mockResolvedValue({ accessToken: 'new-access-token' });

    await expect(
      controller.refresh(
        { cookies: { refreshToken: 'valid-refresh-token' } } as any,
        response as any,
      ),
    ).resolves.toEqual({ ok: true, accessToken: 'new-access-token' });

    expect(response.cookie).toHaveBeenCalledWith(
      'accessToken',
      'new-access-token',
      expect.objectContaining({
        httpOnly: true,
        sameSite: 'lax',
      }),
    );
  });
});
