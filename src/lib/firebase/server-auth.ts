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
  try {
    const expiresIn = 60 * 60 * 24 * 5 * 1000; // 5 days
    const { getAuth } = require('firebase-admin/auth');
    const sessionCookie = await getAuth(getAdminApp()).createSessionCookie(idToken, {expiresIn});
    
    const cookieStore = await cookies();
    cookieStore.set('session', sessionCookie, {
      maxAge: expiresIn,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    });
    
    console.log('Session cookie created successfully');
    return sessionCookie;
  } catch (error) {
    console.error('Error creating session cookie:', error);
    throw error;
  }
}

export async function verifySessionCookie(request: NextRequest) {
  const sessionCookie = request.cookies.get('session')?.value;

  if (!sessionCookie) {
    return null;
  }

  try {
    const { getAuth } = require('firebase-admin/auth');
    const decodedClaims = await getAuth(getAdminApp()).verifySessionCookie(sessionCookie, true);
    return decodedClaims;
  } catch (error) {
    console.error('Error verifying session cookie:', error);
    return null;
  }
}

export async function clearSessionCookie() {
  try {
    const cookieStore = await cookies();
    cookieStore.delete('session');
    console.log('Session cookie cleared successfully');
  } catch (error) {
    console.error('Error clearing session cookie:', error);
  }
}
