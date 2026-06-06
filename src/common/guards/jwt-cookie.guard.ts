import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtCookieGuard implements CanActivate {
  constructor(private jwt: JwtService, private config: ConfigService) {}

  async canActivate(ctx: ExecutionContext) {
    const req = ctx.switchToHttp().getRequest();
    const token = req.cookies?.accessToken;

    if (!token) throw new UnauthorizedException('Not authenticated');

    try {
      const payload = await this.jwt.verifyAsync(token, {
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
}
