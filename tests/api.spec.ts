import { test, expect } from '@playwright/test';

test.describe('API endpoints', () => {
  test('POST /api/subscribe returns 400 without required fields', async ({ request }) => {
    const response = await request.post('/api/subscribe', {
      data: {},
    });
    expect(response.status()).toBe(400);

    const body = await response.json();
    expect(body.error).toContain('required');
  });

  test('POST /api/subscribe returns 400 with missing firstName', async ({ request }) => {
    const response = await request.post('/api/subscribe', {
      data: { email: 'test@example.com' },
    });
    expect(response.status()).toBe(400);

    const body = await response.json();
    expect(body.error).toContain('required');
  });

  test('POST /api/subscribe returns 400 with missing email', async ({ request }) => {
    const response = await request.post('/api/subscribe', {
      data: { firstName: 'Test' },
    });
    expect(response.status()).toBe(400);

    const body = await response.json();
    expect(body.error).toContain('required');
  });

  test('POST /api/webhooks/kit returns 401 without secret', async ({ request }) => {
    const response = await request.post('/api/webhooks/kit', {
      data: { subscriber: { email_address: 'test@example.com' } },
    });
    expect(response.status()).toBe(401);

    const body = await response.json();
    expect(body.error).toBe('Unauthorized');
  });

  test('POST /api/webhooks/kit returns 401 with wrong secret', async ({ request }) => {
    const response = await request.post('/api/webhooks/kit?secret=wrong', {
      data: { subscriber: { email_address: 'test@example.com' } },
    });
    expect(response.status()).toBe(401);

    const body = await response.json();
    expect(body.error).toBe('Unauthorized');
  });

  // Note: Testing actual subscription would require real Firebase/Kit credentials
  // These tests verify the API routes exist and handle validation correctly
});
