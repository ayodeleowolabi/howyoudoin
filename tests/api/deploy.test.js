const db = require('../support/db');
const User = require('../../models/user');
const Review = require('../../models/review');
const seedDemo = require('../../scripts/seed-demo');
const { app, request } = require('../support/helpers');

beforeAll(() => db.connect('deploy-tests'));
afterEach(() => db.clear());
afterAll(() => db.disconnect());

test('GET /healthz responds ok for the hosting platform', async () => {
  const res = await request(app).get('/healthz').expect(200);
  expect(res.text).toBe('ok');
});

test('seedDemo creates a demo account that can log in and see sample reviews', async () => {
  jest.spyOn(console, 'log').mockImplementation(() => {});
  await seedDemo();

  const agent = request.agent(app);
  await agent.post('/auth/login').type('form')
    .send({ username: 'demo', password: 'howudoin-demo' })
    .expect(302).expect('Location', '/');
  const res = await agent.get('/student/reviews').expect(200);
  expect((res.text.match(/data-testid="review-card"/g) || []).length).toBe(4);
});

test('seedDemo({ onlyIfMissing }) leaves an existing demo account untouched', async () => {
  jest.spyOn(console, 'log').mockImplementation(() => {});
  await seedDemo();
  const demo = await User.findOne({ username: 'demo' });
  await Review.deleteMany({ owner: demo._id });

  const created = await seedDemo({ onlyIfMissing: true });
  expect(created).toBe(false);
  expect(await Review.countDocuments({ owner: demo._id })).toBe(0);

  await seedDemo(); // a normal run resets the sample data
  expect(await Review.countDocuments({ owner: demo._id })).toBe(4);
});
