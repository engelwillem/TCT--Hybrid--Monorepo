'use client';

import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore'

// IMPORTANT: DO NOT MODIFY THIS FUNCTION
export function initializeFirebase() {
  if (!getApps().length) {
    let firebaseApp;

    const hasExplicitConfig = Boolean(
      firebaseConfig?.apiKey && firebaseConfig?.projectId && firebaseConfig?.appId
    );

    if (hasExplicitConfig) {
      firebaseApp = initializeApp(firebaseConfig);
    } else {
      try {
        // Fallback for Firebase App Hosting style initialization.
        firebaseApp = initializeApp();
      } catch {
        // Keep fallback silent in production to avoid console noise for users.
        firebaseApp = initializeApp(firebaseConfig);
      }
    }

    if (!firebaseApp) {
      firebaseApp = initializeApp(firebaseConfig);
    }

    return getSdks(firebaseApp);
  }

  // If already initialized, return the SDKs with the already initialized App
  return getSdks(getApp());
}

export function getSdks(firebaseApp: FirebaseApp) {
  return {
    firebaseApp,
    auth: getAuth(firebaseApp),
    firestore: getFirestore(firebaseApp)
  };
}

export * from './provider';
export * from './client-provider';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
export * from './non-blocking-updates';
export * from './non-blocking-login';
export * from './errors';
export * from './error-emitter';
