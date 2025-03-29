import request from 'supertest';
import app from '../src/app';

describe('Project API', () => {
  let token: string;
  let projectId: string;

  beforeAll(async () => {
    // Authenticate and get a token
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@example.com', password: 'password123' });
    token = res.body.token;
  });

  it('should create a new project', async () => {
    const res = await request(app)
      .post('/api/project')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Test Project', description: 'A sample project' });
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
    projectId = res.body.id;
  });

  it('should retrieve project details', async () => {
    const res = await request(app)
      .get(`/api/project/${projectId}`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('name', 'Test Project');
  });
});
