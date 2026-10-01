const request = require('supertest');
const app = require('../../app');

const PASSWORD = 'secret123';

async function signUp(username, password = PASSWORD) {
  const agent = request.agent(app);
  await agent
    .post('/auth/sign-up')
    .type('form')
    .send({ username, password, confirmPassword: password })
    .expect(302);
  return agent;
}

const validReview = (overrides = {}) => ({
  weekNumber: 'Week 1',
  rating: '3 - I have a concrete level of understanding',
  weeklyReview: 'Slope finally makes sense.',
  ...overrides,
});

module.exports = { app, request, signUp, validReview, PASSWORD };
