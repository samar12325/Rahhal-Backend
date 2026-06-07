import type { Request } from 'express';

export type AuthenticatedUser = {
  userId: string;
  role: string;
};

export type RequestWithAuthCookies = Request & {
  user?: AuthenticatedUser;
  cookies?: {
    accessToken?: string;
    refreshToken?: string;
  };
};

export type AuthenticatedRequest = RequestWithAuthCookies & {
  user: AuthenticatedUser;
};
