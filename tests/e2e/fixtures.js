const base = require('@playwright/test');

const PASSWORD = 'secret123';
const uniqueName = (prefix = 'student') => `${prefix}${Date.now()}${Math.floor(Math.random() * 1e4)}`;

async function signUp(page, username = uniqueName()) {
  await page.goto('/auth/sign-up');
  await page.getByLabel('Username').fill(username);
  await page.getByLabel('Password', { exact: true }).fill(PASSWORD);
  await page.getByLabel('Confirm password').fill(PASSWORD);
  await page.getByRole('button', { name: 'Sign up' }).click();
  await base.expect(page.getByRole('heading', { name: `Hi, ${username}!` })).toBeVisible();
  return username;
}

async function createReview(page, { week = 'Week 1', score = 3, note = 'Slope makes sense now.' } = {}) {
  await page.goto('/student/reviews/new');
  await page.getByLabel('Week').selectOption(week);
  await page.locator('.rating-option').filter({ has: page.locator(`.rating-num:text-is("${score}")`) }).click();
  await page.getByLabel('Tell me more').fill(note);
  await page.getByRole('button', { name: 'Submit review' }).click();
}

const test = base.test.extend({
  // A page that is already signed in as a fresh user
  studentPage: async ({ page }, use) => {
    const username = await signUp(page);
    page.username = username;
    await use(page);
  },
});

module.exports = { test, expect: base.expect, signUp, createReview, uniqueName, PASSWORD };
