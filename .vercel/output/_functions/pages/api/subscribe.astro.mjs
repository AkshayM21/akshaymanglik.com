import { getApps, initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
export { renderers } from '../../renderers.mjs';

const prerender = false;
if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: "dereferenced-32c0d",
      clientEmail: "firebase-adminsdk-fbsvc@dereferenced-32c0d.iam.gserviceaccount.com",
      privateKey: "-----BEGIN PRIVATE KEY-----\nMIIEvwIBADANBgkqhkiG9w0BAQEFAASCBKkwggSlAgEAAoIBAQCpvHf6UXYpFoDr\nmZexCGn3fp0Wa05bjyZvmbawY96cvZvMkHuR3Kx/lr8gjNnhTQVr4IpIfH+xaq67\n854BHSD5rN62YBop4MXWkkVl7USJrz51EoMlA9zNfz5K64ZANkca5SY4hG2Hk20c\n3/ML920wPZ/iP/WTgeJw3PM1WRLaf0DExAGlmbheUTlHiSIXZ52ZZSU4o6h2HSAx\nt0RVlhhWv7iNGQjlqr/SuxQr7tAX4Qd0/ymxh4thpdsJZzg6Gqf4IyxMPddb+kMP\nAGGac3z8YO3Aosv2yyCHYNY42MiVfnht0DaCG4rS26WjyO2oFPs7PiHnqOxTzVVI\nMH7P5nofAgMBAAECggEAPyUjSVeW6tA5Y+y+9xhXO8C5tgZznzJRLUF1Kofs4EjV\ntjOmFOyQq+Kr9fMQd3XM54YgS7ktVBaJLNkD1gw9IUWDkTuNYDkDwMCn2rR7Q/GS\n/cDGUzXtpfGJfhvC1Q6cQ1AueOYjTUW2WQCjjbcdws2aNnRu6tJuKGi6fgVGM0x6\n8yDC5+yJ/cDPiOuev4rdPAdYJp90/crSNJ7E8qQAch4m6qtdKYEloquPIJRW67r6\nBJ5LTQ9nnwXYAVb6LaCfYUiQU/rjGVzrzKVaKzBW4Uu8483VNVJ8dk6An/9dZq+X\ndZvXub1wwixIt7+Ntkcb//79zSkPoGKemBJK9tKjkQKBgQDS0BiBd6SYhBejiMoh\nisZGhHrfBxrN8SlO97KHT4qqG7CL3Q9XqACf94sdMezUGLDTh/Nz4kE57Hkql9Ox\nbtgjN1L+5KsWacJ/Dzxtxbdijry2iXM2/Sc+2uhfXqZ0ERpuo7GvGcn1rzN6urrF\nyqy585b9sfneydJ1QlTx9qThOQKBgQDOHmD+E9xC6KdsFYF8ephoMqJuc2UCvf2C\nQGx7kqvhPwhRVZ6dhfbTSCITTdheIP/SUokHPmjYcOK80jqQtcoazzLhmXo248po\nGOlK1rFkfQyH8biN1WMOkuSasaqynhA0cuc7h01oqlmmYRlFNs5Sh76vPQOkmPX7\neRtI4Y4uFwKBgQC3a2F2+98U6BEdMz4TEwhSgJ/bfvX+ay5yy6bkfft66B6iglMA\nBGeOxzWd0DtripQHaAkVMa1otWvy+Ciy/2tEsLUgm1qUZK5aGKqOI/Hb6a8d7td0\n56wGzzZRDCwtXlguHXTSkdCbV7WlueQZha7lF6Cu2PQ7uEPJzE3WPK/WWQKBgQCZ\niHV1LPQH/ucfEpHmWCeIjhcCMQCP31ejmztzfNh9KweWFjHVYoFt9jAzsuu1id0l\nHIenlqxgdQ3f2rT3MAKAn9BlzX4Evv75NX0pWuy+Tot0A/EV7Vog8/hG5oqhDC5D\n80ccx3c4vJOU5IT/UoizXxwBynAZPjsUe6yASEsxNwKBgQCSN/RPQeqan4eZnmOe\nMJmhtEu/JNXJkm+c9JXJctIxBzBbct7BffoIUFlJIQ0VEMDzRKxFOp5lYbabWKUp\ngL8mWkfwpJpLn2Aae8GhQwz06LWHjdM1Vr7PbAUM/0nSOjZGlSGwKzs2m1r7iuWX\nanngXSE8OH/asdXS5obqhL2WmA==\n-----END PRIVATE KEY-----\n"?.replace(/\\n/g, "\n")
    })
  });
}
const db = getFirestore();
const POST = async ({ request }) => {
  try {
    const body = await request.json();
    const { email, firstName } = body;
    if (!email || !firstName) {
      return new Response(JSON.stringify({ error: "Email and first name are required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    const timestamp = (/* @__PURE__ */ new Date()).toISOString();
    await db.collection("subscribers").doc(email).set({
      email,
      firstName,
      subscribedAt: timestamp,
      status: "active"
    }, { merge: true });
    const kitResponse = await fetch("https://api.kit.com/v4/subscribers", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Kit-Api-Key": "T9BNx_zO4o5YYY63ofYzcg"
      },
      body: JSON.stringify({
        email_address: email,
        first_name: firstName
      })
    });
    if (!kitResponse.ok) {
      const error = await kitResponse.json();
      throw new Error(error.message || "Kit API error");
    }
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("Subscribe error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
};
const ALL = async () => {
  return new Response(JSON.stringify({ error: "Method not allowed" }), {
    status: 405,
    headers: { "Content-Type": "application/json" }
  });
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  ALL,
  POST,
  prerender
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
