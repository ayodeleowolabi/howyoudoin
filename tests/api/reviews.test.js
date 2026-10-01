const mongoose = require('mongoose');
const db = require('../support/db');
const Review = require('../../models/review');
const User = require('../../models/user');
const { app, request, signUp, validReview } = require('../support/helpers');

beforeAll(() => db.connect('review-tests'));
afterEach(() => db.clear());
afterAll(() => db.disconnect());

async function createReview(agent, overrides) {
  await agent.post('/student/reviews').type('form').send(validReview(overrides)).expect(302);
  return Review.findOne().sort({ createdAt: -1 });
}

describe('route protection', () => {
  test.each([
    ['GET', '/student/reviews'],
    ['GET', '/student/reviews/new'],
    ['POST', '/student/reviews'],
  ])('%s %s redirects anonymous users to login', async (method, url) => {
    await request(app)[method.toLowerCase()](url).expect(302).expect('Location', '/auth/login');
  });
});

describe('create', () => {
  test('saves a valid review owned by the logged-in user', async () => {
    const alice = await signUp('alice');
    const review = await createReview(alice);
    const user = await User.findOne({ username: 'alice' });

    expect(review.weekNumber).toBe('Week 1');
    expect(review.score).toBe(3);
    expect(String(review.owner)).toBe(String(user._id));
  });

  test('ignores an owner field sent in the form (BUG-03)', async () => {
    const alice = await signUp('alice');
    await signUp('bob');
    const bob = await User.findOne({ username: 'bob' });

    const review = await createReview(alice, { owner: String(bob._id) });
    const user = await User.findOne({ username: 'alice' });
    expect(String(review.owner)).toBe(String(user._id));
  });

  test('trims whitespace from the reflection (BUG-11)', async () => {
    const alice = await signUp('alice');
    const review = await createReview(alice, { weeklyReview: '\n   hello   \n' });
    expect(review.weeklyReview).toBe('hello');
  });

  test.each([
    ['an invalid week', { weekNumber: 'Week 9' }, 'Please choose a week between 1 and 5.'],
    ['an invalid rating', { rating: '7 - genius' }, 'Please choose a rating from 0 to 4.'],
    ['a missing rating', { rating: undefined }, 'Please choose a rating.'],
  ])('rejects %s with a 422 and an error message (BUG-08)', async (_label, overrides, message) => {
    const alice = await signUp('alice');
    const body = validReview(overrides);
    Object.keys(body).forEach((k) => body[k] === undefined && delete body[k]);

    const res = await alice.post('/student/reviews').type('form').send(body).expect(422);
    expect(res.text).toContain(message);
    expect(await Review.countDocuments()).toBe(0);
  });
});

describe('read', () => {
  test('lists only the current user\'s reviews', async () => {
    const alice = await signUp('alice');
    const bob = await signUp('bob');
    await createReview(alice, { weeklyReview: 'alice note' });
    await createReview(bob, { weeklyReview: 'bob note' });

    const res = await alice.get('/student/reviews').expect(200);
    expect(res.text).toContain('alice note');
    expect(res.text).not.toContain('bob note');
  });

  test('shows an empty state when there are no reviews (BUG-10)', async () => {
    const alice = await signUp('alice');
    const res = await alice.get('/student/reviews').expect(200);
    expect(res.text).toContain('You have no reviews yet');
  });

  test.each([
    ['a valid id that does not exist', () => new mongoose.Types.ObjectId()],
    ['a malformed id', () => 'not-an-id'],
  ])('returns 404 for %s (BUG-05)', async (_label, makeId) => {
    const alice = await signUp('alice');
    const res = await alice.get(`/student/reviews/${makeId()}`).expect(404);
    expect(res.text).toContain('Page not found');
  });
});

describe('update', () => {
  test('updates only the allowed fields and redirects to the review', async () => {
    const alice = await signUp('alice');
    const review = await createReview(alice);

    await alice
      .post(`/student/reviews/${review._id}?_method=PUT`)
      .type('form')
      .send({ weekNumber: 'Week 2', rating: review.rating, weeklyReview: 'updated' })
      .expect(302)
      .expect('Location', `/student/reviews/${review._id}`);

    const updated = await Review.findById(review._id);
    expect(updated.weekNumber).toBe('Week 2');
    expect(updated.weeklyReview).toBe('updated');
  });

  test('cannot reassign the review to another user (BUG-03)', async () => {
    const alice = await signUp('alice');
    await signUp('bob');
    const bob = await User.findOne({ username: 'bob' });
    const review = await createReview(alice);

    await alice
      .post(`/student/reviews/${review._id}?_method=PUT`)
      .type('form')
      .send({ owner: String(bob._id) });

    const after = await Review.findById(review._id);
    expect(String(after.owner)).not.toBe(String(bob._id));
  });

  test('rejects invalid updates with a 422 and keeps the old data', async () => {
    const alice = await signUp('alice');
    const review = await createReview(alice);
    await alice
      .post(`/student/reviews/${review._id}?_method=PUT`)
      .type('form')
      .send({ weekNumber: 'Week 42' })
      .expect(422);
    expect((await Review.findById(review._id)).weekNumber).toBe('Week 1');
  });

  test('edit form pre-selects the saved rating (BUG-04)', async () => {
    const alice = await signUp('alice');
    const review = await createReview(alice, {
      rating: '4 - I feel very comfortable with my level of understanding',
    });
    const res = await alice.get(`/student/reviews/${review._id}/edit`).expect(200);
    expect(res.text).toMatch(/value="4 - I feel very comfortable with my level of understanding"\s+checked/);
  });
});

describe('delete', () => {
  test('deletes the user\'s own review', async () => {
    const alice = await signUp('alice');
    const review = await createReview(alice);
    await alice.post(`/student/reviews/${review._id}?_method=DELETE`).expect(302);
    expect(await Review.findById(review._id)).toBeNull();
  });
});

describe('authorization between students (BUG-01, BUG-02)', () => {
  let alice;
  let bob;
  let review;

  beforeEach(async () => {
    alice = await signUp('alice');
    bob = await signUp('bob');
    review = await createReview(alice, { weeklyReview: 'private to alice' });
  });

  test('another user cannot view the review', async () => {
    const res = await bob.get(`/student/reviews/${review._id}`).expect(404);
    expect(res.text).not.toContain('private to alice');
  });

  test('another user cannot open the edit form', async () => {
    await bob.get(`/student/reviews/${review._id}/edit`).expect(404);
  });

  test('another user cannot update the review', async () => {
    await bob
      .post(`/student/reviews/${review._id}?_method=PUT`)
      .type('form')
      .send({ weeklyReview: 'hacked' })
      .expect(404);
    expect((await Review.findById(review._id)).weeklyReview).toBe('private to alice');
  });

  test('another user cannot delete the review', async () => {
    await bob.post(`/student/reviews/${review._id}?_method=DELETE`).expect(404);
    expect(await Review.findById(review._id)).not.toBeNull();
  });
});
