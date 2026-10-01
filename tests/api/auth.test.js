const bcrypt = require('bcrypt');
const db = require('../support/db');
const User = require('../../models/user');
const { app, request, signUp, PASSWORD } = require('../support/helpers');

beforeAll(() => db.connect('auth-tests'));
afterEach(() => db.clear());
afterAll(() => db.disconnect());

describe('POST /auth/sign-up', () => {
  test('creates a user, hashes the password, and logs them in', async () => {
    const agent = await signUp('alice');

    const user = await User.findOne({ username: 'alice' });
    expect(user).not.toBeNull();
    expect(user.password).not.toBe(PASSWORD);
    expect(bcrypt.compareSync(PASSWORD, user.password)).toBe(true);

    const home = await agent.get('/').expect(200);
    expect(home.text).toContain('Hi, alice!');
  });

  test('uses a bcrypt cost factor of at least 10 (SEC-01)', async () => {
    await signUp('alice');
    const user = await User.findOne({ username: 'alice' });
    expect(bcrypt.getRounds(user.password)).toBeGreaterThanOrEqual(10);
  });

  test('rejects mismatched passwords with a visible error (BUG-06)', async () => {
    const res = await request(app)
      .post('/auth/sign-up')
      .type('form')
      .send({ username: 'alice', password: 'secret123', confirmPassword: 'different' })
      .expect(422);

    expect(res.text).toContain('Passwords do not match.');
    expect(await User.countDocuments()).toBe(0);
  });

  test('rejects a username that is already taken (BUG-06)', async () => {
    await signUp('alice');
    const res = await request(app)
      .post('/auth/sign-up')
      .type('form')
      .send({ username: 'alice', password: 'another1', confirmPassword: 'another1' })
      .expect(422);

    expect(res.text).toContain('That username is already taken.');
    expect(await User.countDocuments({ username: 'alice' })).toBe(1);
  });

  test('rejects passwords shorter than 6 characters', async () => {
    const res = await request(app)
      .post('/auth/sign-up')
      .type('form')
      .send({ username: 'alice', password: '123', confirmPassword: '123' })
      .expect(422);
    expect(res.text).toContain('at least 6 characters');
  });

  test('keeps the entered username when the form is re-rendered', async () => {
    const res = await request(app)
      .post('/auth/sign-up')
      .type('form')
      .send({ username: 'alice', password: 'secret123', confirmPassword: 'nope' });
    expect(res.text).toMatch(/name="username" value="alice"/);
  });
});

describe('POST /auth/login', () => {
  beforeEach(() => signUp('alice'));

  test('logs in with valid credentials', async () => {
    const agent = request.agent(app);
    await agent
      .post('/auth/login')
      .type('form')
      .send({ username: 'alice', password: PASSWORD })
      .expect(302)
      .expect('Location', '/');
    const home = await agent.get('/');
    expect(home.text).toContain('Hi, alice!');
  });

  test.each([
    ['wrong password', { username: 'alice', password: 'wrongpass' }],
    ['unknown user', { username: 'nobody', password: PASSWORD }],
  ])('returns 401 with an error message for %s (BUG-07)', async (_label, creds) => {
    const res = await request(app).post('/auth/login').type('form').send(creds).expect(401);
    expect(res.text).toContain('Incorrect username or password.');
  });
});

describe('GET /auth/logout', () => {
  test('ends the session', async () => {
    const agent = await signUp('alice');
    await agent.get('/auth/logout').expect(302);
    await agent.get('/student/reviews').expect(302).expect('Location', '/auth/login');
  });
});
