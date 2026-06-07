import { GUARDS_METADATA } from '@nestjs/common/constants';
import { AdminTripsController } from './admin-trips.controller';
import { JwtCookieGuard } from '../../common/guards/jwt-cookie.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { ROLES_KEY } from '../../common/decorators/roles.decorator';

function readMetadata<T>(key: string, target: object): T | undefined {
  return Reflect.getMetadata(key, target) as T | undefined;
}

describe('AdminTripsController metadata', () => {
  it('protects admin trips endpoints with JWT auth and admin role metadata', () => {
    const guards = readMetadata<unknown[]>(
      GUARDS_METADATA,
      AdminTripsController,
    );
    const roles = readMetadata<string[]>(ROLES_KEY, AdminTripsController);

    expect(guards).toEqual([JwtCookieGuard, RolesGuard]);
    expect(roles).toEqual(['admin']);
  });
});
