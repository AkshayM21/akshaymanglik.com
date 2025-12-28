import type { VercelRequest, VercelResponse } from '@vercel/node';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Firebase init (same as subscribe.ts)
if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

const db = getFirestore();

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Security: Verify secret token from query param
  const { secret } = req.query;
  if (secret !== process.env.KIT_WEBHOOK_SECRET) {
    console.error('Unauthorized webhook attempt');
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // Extract subscriber data from Kit webhook payload
  const { subscriber } = req.body;

  if (!subscriber?.email_address) {
    return res.status(400).json({ error: 'No subscriber data found' });
  }

  try {
    // Update Firebase: mark as unsubscribed
    await db.collection('subscribers').doc(subscriber.email_address).update({
      status: 'unsubscribed',
      unsubscribedAt: new Date().toISOString(),
    });

    console.log(`Marked ${subscriber.email_address} as unsubscribed`);
    return res.status(200).json({ success: true });

  } catch (error: any) {
    console.error('Webhook error:', error);
    return res.status(500).json({ error: error.message });
  }
}
