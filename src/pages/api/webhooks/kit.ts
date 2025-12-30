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

export const POST: APIRoute = async ({ request, url }) => {
  // Security: Verify secret token from query param
  const secret = url.searchParams.get('secret');
  if (secret !== import.meta.env.KIT_WEBHOOK_SECRET) {
    console.error('Unauthorized webhook attempt');
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const body = await request.json();
    const { subscriber } = body;

    if (!subscriber?.email_address) {
      return new Response(JSON.stringify({ error: 'No subscriber data found' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Update Firebase: mark as unsubscribed
    await db.collection('subscribers').doc(subscriber.email_address).update({
      status: 'unsubscribed',
      unsubscribedAt: new Date().toISOString(),
    });

    console.log(`Marked ${subscriber.email_address} as unsubscribed`);
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('Webhook error:', error);
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
