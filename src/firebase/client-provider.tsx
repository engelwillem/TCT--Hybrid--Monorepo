'use client';

import React, { useEffect, useMemo, type ReactNode } from 'react';
import { browserLocalPersistence, setPersistence } from 'firebase/auth';
import { FirebaseProvider } from '@/firebase/provider';
import { initializeFirebase } from '@/firebase';

interface FirebaseClientProviderProps {
  children: ReactNode;
}

export function FirebaseClientProvider({ children }: FirebaseClientProviderProps) {
  const firebaseServices = useMemo(() => {
    // Initialize Firebase on the client side, once per component mount.
    return initializeFirebase();
  }, []); // Empty dependency array ensures this runs only once on mount

  useEffect(() => {
    // Keep auth session across browser restarts so the app feels persistent.
    void setPersistence(firebaseServices.auth, browserLocalPersistence).catch(() => {
      // Silent fallback keeps auth flow working even if browser blocks persistence APIs.
    });
  }, [firebaseServices.auth]);

  return (
    <FirebaseProvider
      firebaseApp={firebaseServices.firebaseApp}
      auth={firebaseServices.auth}
      firestore={firebaseServices.firestore}
    >
      {children}
    </FirebaseProvider>
  );
}
