'use client';

import React, { useMemo } from 'react';
import { initializeApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { firebaseConfig, hasFirebaseClientConfig } from './config';
import { FirebaseProvider } from './provider';

export function FirebaseClientProvider({ children }: { children: React.ReactNode }) {
  const services = useMemo(() => {
    if (!hasFirebaseClientConfig) {
      return { app: null, db: null, auth: null };
    }
    
    try {
      const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
      const db = getFirestore(app);
      const auth = getAuth(app);
      return { app, db, auth };
    } catch (error) {
      console.error("Firebase initialization failed:", error);
      return { app: null, db: null, auth: null };
    }
  }, []);

  return (
    <FirebaseProvider app={services.app} db={services.db} auth={services.auth}>
      {children}
    </FirebaseProvider>
  );
}
