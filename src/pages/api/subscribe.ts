import type { APIRoute } from 'astro';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

export const prerender = false;

// Initialize Firebase Admin (singleton pattern)
if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: import.meta.env.FIREBASE_PROJECT_ID,
      clientEmail: import.meta.env.FIREBASE_CLIENT_EMAIL,
      privateKey: import.meta.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

const db = getFirestore();

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { email, firstName } = body;

    if (!email || !firstName) {
      return new Response(JSON.stringify({ error: 'Email and first name are required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // 1. Save to Firebase
    const timestamp = new Date().toISOString();
    await db.collection('subscribers').doc(email).set({
      email,
      firstName,
      subscribedAt: timestamp,
      status: 'active',
    }, { merge: true });

    // 2. Send to Kit API v4
    const kitResponse = await fetch('https://api.kit.com/v4/subscribers', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Kit-Api-Key': import.meta.env.KIT_V4_API_KEY!,
      },
      body: JSON.stringify({
        email_address: email,
        first_name: firstName,
      }),
    });

    if (!kitResponse.ok) {
      const error = await kitResponse.json();
      throw new Error(error.message || 'Kit API error');
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('Subscribe error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

// Handle other methods
export const ALL: APIRoute = async () => {
  return new Response(JSON.stringify({ error: 'Method not allowed' }), {
    status: 405,
    headers: { 'Content-Type': 'application/json' },
  });
};
