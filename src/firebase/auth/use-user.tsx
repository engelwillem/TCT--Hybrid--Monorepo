'use client';

import { useUser as useFirebaseUser } from '../provider';

export function useUser() {
  const { user, isUserLoading, userError } = useFirebaseUser();
  const status = isUserLoading ? 'restoring' : user ? 'authenticated' : 'guest';

  return {
    user,
    loading: isUserLoading,
    isUserLoading,
    userError,
    status,
  } as const;
}
