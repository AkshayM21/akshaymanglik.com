import type { VercelRequest, VercelResponse } from '@vercel/node';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Initialize Firebase Admin (singleton pattern)
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

  const { email, firstName } = req.body;

  if (!email || !firstName) {
    return res.status(400).json({ error: 'Email and first name are required' });
  }

  try {
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
        'X-Kit-Api-Key': process.env.KIT_API_KEY!,
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

    return res.status(200).json({ success: true });

  } catch (error: any) {
    console.error('Subscribe error:', error);
    return res.status(500).json({ error: error.message });
  }
}
