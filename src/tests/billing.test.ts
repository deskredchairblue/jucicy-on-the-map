import request from 'supertest';
import app from '../src/app';

describe('Billing & Subscription API', () => {
  let token: string;

  beforeAll(async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@example.com', password: 'password123' });
    token = res.body.token;
  });

  it('should list available billing plans', async () => {
    const res = await request(app)
      .get('/api/billing/plans')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('should start a checkout session', async () => {
    const res = await request(app)
      .post('/api/billing/checkout')
      .set('Authorization', `Bearer ${token}`)
      .send({ planId: 'basic-plan' });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('checkoutUrl');
  });
});
