import type { AuthUser, CondominiumModule } from './types';

export function isCondominiumModuleEnabled(
  user: AuthUser | null | undefined,
  module: CondominiumModule,
) {
  if (!user) {
    return false;
  }

  if (user.role === 'SUPERADMIN') {
    return true;
  }

  return user.currentCondominium?.activeModules?.includes(module) ?? false;
}
