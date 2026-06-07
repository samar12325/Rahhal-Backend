import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';

type RoleAwareRequest = {
  user?: {
    role?: string;
  };
};

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext) {
    const requiredRoles =
      this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
        context.getHandler(),
        context.getClass(),
      ]) ?? [];

    if (!requiredRoles.length) return true;

    const request = context.switchToHttp().getRequest<RoleAwareRequest>();
    const role =
      typeof request.user?.role === 'string'
        ? request.user.role.trim().toLowerCase()
        : '';

    const hasRequiredRole = requiredRoles.some(
      (requiredRole) => requiredRole.trim().toLowerCase() === role,
    );

    if (!hasRequiredRole) {
      throw new ForbiddenException('Admin access required');
    }

    return true;
  }
}
