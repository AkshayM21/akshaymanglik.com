import type { APIRoute } from 'astro';
import { getDb, normalizeEmail } from '../../../lib/firebase';

export const prerender = false;

export const POST: APIRoute = async ({ request, url }) => {
  // Security: Verify secret token from query param (BEFORE Firebase init)
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

    // Normalize to match the doc id written by subscribe.ts
    const normalizedEmail = normalizeEmail(subscriber.email_address);

    // Update Firebase: mark as unsubscribed (lazy init happens here).
    // set(..., { merge: true }) is idempotent: it won't throw NOT_FOUND for
    // subscribers who signed up directly via a Kit form (no Firestore doc).
    await getDb().collection('subscribers').doc(normalizedEmail).set({
      status: 'unsubscribed',
      unsubscribedAt: new Date().toISOString(),
    }, { merge: true });

    // Avoid logging the full email (PII): only the domain is retained for diagnostics.
    const emailDomain = normalizedEmail.split('@')[1] ?? 'unknown';
    console.log(`Marked subscriber (domain: ${emailDomain}) as unsubscribed`);
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('Webhook error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
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
