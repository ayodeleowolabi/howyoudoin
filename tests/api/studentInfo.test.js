const db = require('../support/db');
const User = require('../../models/user');
const { app, request, signUp } = require('../support/helpers');

beforeAll(() => db.connect('studentinfo-tests'));
afterEach(() => db.clear());
afterAll(() => db.disconnect());

const info = (overrides = {}) => ({
  parentname: 'Jane Doe',
  phone: '202-555-0100',
  address: '1 Main St',
  homeroomteacher: 'Jones',
  ...overrides,
});

test('redirects anonymous users to login', async () => {
  await request(app).get('/student/information').expect(302).expect('Location', '/auth/login');
});

test('shows an empty state before any info is added', async () => {
  const alice = await signUp('alice');
  const res = await alice.get('/student/information').expect(200);
  expect(res.text).toContain("You haven't added contact info yet");
});

test('creates contact info and displays it', async () => {
  const alice = await signUp('alice');
  await alice.post('/student/information').type('form').send(info()).expect(302);

  const user = await User.findOne({ username: 'alice' });
  expect(user.studentInformation.parentname).toBe('Jane Doe');

  const res = await alice.get('/student/information');
  expect(res.text).toContain('Jane Doe');
  expect(res.text).toContain('Jones');
});

test('updates contact info with PUT', async () => {
  const alice = await signUp('alice');
  await alice.post('/student/information').type('form').send(info());
  await alice.post('/student/information?_method=PUT').type('form').send(info({ phone: '202-555-0199' })).expect(302);
  const user = await User.findOne({ username: 'alice' });
  expect(user.studentInformation.phone).toBe('202-555-0199');
});

test('rejects an unknown homeroom teacher with a 422', async () => {
  const alice = await signUp('alice');
  const res = await alice
    .post('/student/information')
    .type('form')
    .send(info({ homeroomteacher: 'Smith' }))
    .expect(422);
  expect(res.text).toContain('Please check the contact form');
});

test('removes contact info', async () => {
  const alice = await signUp('alice');
  await alice.post('/student/information').type('form').send(info());
  await alice.post('/student/information?_method=DELETE').expect(302);
  const user = await User.findOne({ username: 'alice' });
  expect(user.studentInformation).toBeUndefined();
});

test('deleting when no info exists does not error (BUG-09)', async () => {
  const alice = await signUp('alice');
  const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
  await alice.post('/student/information?_method=DELETE').expect(302);
  expect(spy).not.toHaveBeenCalled();
  spy.mockRestore();
});

test('one student\'s info is never shown to another', async () => {
  const alice = await signUp('alice');
  const bob = await signUp('bob');
  await alice.post('/student/information').type('form').send(info());
  const res = await bob.get('/student/information');
  expect(res.text).not.toContain('Jane Doe');
});
