import { ForbiddenException } from '@nestjs/common';
import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolesGuard } from './roles.guard';

type RoleAwareRequest = {
  user?: {
    role?: string;
  };
};

describe('RolesGuard', () => {
  let reflector: { getAllAndOverride: jest.Mock };
  let guard: RolesGuard;

  beforeEach(() => {
    reflector = {
      getAllAndOverride: jest.fn(),
    };
    guard = new RolesGuard(reflector as unknown as Reflector);
  });

  it('allows requests when no roles metadata is defined', () => {
    reflector.getAllAndOverride.mockReturnValue(undefined);

    expect(guard.canActivate(createContext({ user: { role: 'user' } }))).toBe(
      true,
    );
  });

  it('allows users with the required admin role', () => {
    reflector.getAllAndOverride.mockReturnValue(['admin']);

    expect(guard.canActivate(createContext({ user: { role: 'ADMIN' } }))).toBe(
      true,
    );
  });

  it('rejects users without the required admin role', () => {
    reflector.getAllAndOverride.mockReturnValue(['admin']);

    expect(() =>
      guard.canActivate(createContext({ user: { role: 'user' } })),
    ).toThrow(ForbiddenException);
  });
});

function createContext(request: RoleAwareRequest): ExecutionContext {
  return {
    getHandler: () => 'handler',
    getClass: () => 'class',
    getArgs: () => [],
    getArgByIndex: () => undefined,
    switchToHttp: () => ({
      getRequest: <T = RoleAwareRequest>() => request as unknown as T,
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
