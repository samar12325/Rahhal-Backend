import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import type { RequestWithAuthCookies } from '../types/authenticated-request.type';

type AccessTokenPayload = {
  sub: string;
  role: string;
};

@Injectable()
export class JwtCookieGuard implements CanActivate {
  constructor(
    private jwt: JwtService,
    private config: ConfigService,
  ) {}

  async canActivate(ctx: ExecutionContext) {
    const req = ctx.switchToHttp().getRequest<RequestWithAuthCookies>();
    const token = this.extractAccessToken(req);

    if (typeof token !== 'string' || token.length === 0) {
      throw new UnauthorizedException('Not authenticated');
    }

    try {
      const payload = await this.jwt.verifyAsync<AccessTokenPayload>(token, {
        secret: this.config.get<string>('JWT_ACCESS_SECRET'),
      });

      req.user = {
        userId: payload.sub,
        role: payload.role,
      };

      return true;
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  private extractAccessToken(req: RequestWithAuthCookies) {
    const cookieToken = req.cookies?.accessToken;
    if (typeof cookieToken === 'string' && cookieToken.length > 0) {
      return cookieToken;
    }

    const authorizationHeader = req.headers?.authorization;
    if (typeof authorizationHeader !== 'string') {
      return null;
    }

    const [scheme, token] = authorizationHeader.split(' ');
    if (scheme?.toLowerCase() !== 'bearer' || !token) {
      return null;
    }

    return token;
  }
}
