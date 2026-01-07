'use server';

import {auth} from 'firebase-admin';
import {cookies} from 'next/headers';
import {NextRequest, NextResponse} from 'next/server';
import {initializeApp, getApps, App} from 'firebase-admin/app';
import {credential} from 'firebase-admin';

const FIREBASE_ADMIN_CREDENTIAL = process.env.FIREBASE_ADMIN_CREDENTIAL;

function getAdminApp(): App {
  if (getApps().length > 0) {
    return getApps()[0];
  }

  if (!FIREBASE_ADMIN_CREDENTIAL) {
    throw new Error('FIREBASE_ADMIN_CREDENTIAL environment variable is not set.');
  }

  const serviceAccount = JSON.parse(FIREBASE_ADMIN_CREDENTIAL);

  return initializeApp({
    credential: credential.cert(serviceAccount),
  });
}

export async function createSessionCookie(idToken: string) {
  const expiresIn = 60 * 60 * 24 * 5 * 1000; // 5 days
  const sessionCookie = await auth(getAdminApp()).createSessionCookie(idToken, {expiresIn});
  cookies().set('session', sessionCookie, {
    maxAge: expiresIn,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
  });
}

export async function verifySessionCookie() {
  const cookieStore = cookies();
  const sessionCookie = cookieStore.get('session')?.value;

  if (!sessionCookie) {
    return null;
  }

  try {
    const decodedClaims = await auth(getAdminApp()).verifySessionCookie(sessionCookie, true);
    return decodedClaims;
  } catch (error) {
    console.error('Error verifying session cookie:', error);
    return null;
  }
}

export async function clearSessionCookie() {
  cookies().delete('session');
}
