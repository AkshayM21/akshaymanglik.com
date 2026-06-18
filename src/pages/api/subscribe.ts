import type { APIRoute } from 'astro';
import { getDb, normalizeEmail, isValidEmail } from '../../lib/firebase';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { email, firstName } = body;

    // Validate BEFORE initializing Firebase
    if (!email || !firstName) {
      return new Response(JSON.stringify({ error: 'Email and first name are required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Normalize and validate email (deterministic doc id, matches unsubscribe webhook)
    const normalizedEmail = normalizeEmail(email);
    if (!isValidEmail(normalizedEmail)) {
      return new Response(JSON.stringify({ error: 'A valid email is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // 1. Save to Firebase (lazy init happens here)
    const timestamp = new Date().toISOString();
    await getDb().collection('subscribers').doc(normalizedEmail).set({
      email: normalizedEmail,
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
        email_address: normalizedEmail,
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
