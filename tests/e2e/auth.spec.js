const { test, expect, signUp, uniqueName, PASSWORD } = require('./fixtures');

test.describe('Authentication', () => {
  test('a new student can sign up and lands on their dashboard', async ({ page }) => {
    const name = await signUp(page);
    await expect(page.getByText("This week's objective")).toBeVisible();
    await expect(page.getByRole('link', { name: 'Log out' })).toBeVisible();
    await expect(page.getByTestId('review-count')).toHaveText('0');
    expect(name).toBeTruthy();
  });

  test('shows an error when passwords do not match', async ({ page }) => {
    await page.goto('/auth/sign-up');
    await page.getByLabel('Username').fill(uniqueName());
    await page.getByLabel('Password', { exact: true }).fill(PASSWORD);
    await page.getByLabel('Confirm password').fill('different1');
    await page.getByRole('button', { name: 'Sign up' }).click();
    await expect(page.getByTestId('form-error')).toHaveText('Passwords do not match.');
  });

  test('a student can log out and log back in', async ({ page }) => {
    const name = await signUp(page);
    await page.getByRole('link', { name: 'Log out' }).click();
    await expect(page.getByRole('link', { name: 'Sign up' })).toBeVisible();

    await page.getByRole('link', { name: 'Log in' }).click();
    await page.getByLabel('Username').fill(name);
    await page.getByLabel('Password').fill(PASSWORD);
    await page.getByRole('button', { name: 'Log in' }).click();
    await expect(page.getByRole('heading', { name: `Hi, ${name}!` })).toBeVisible();
  });

  test('wrong password shows an error and keeps the username', async ({ page }) => {
    const name = await signUp(page);
    await page.getByRole('link', { name: 'Log out' }).click();
    await page.goto('/auth/login');
    await page.getByLabel('Username').fill(name);
    await page.getByLabel('Password').fill('wrongpass');
    await page.getByRole('button', { name: 'Log in' }).click();
    await expect(page.getByTestId('form-error')).toHaveText('Incorrect username or password.');
    await expect(page.getByLabel('Username')).toHaveValue(name);
  });

  test('protected pages send anonymous visitors to login', async ({ page }) => {
    await page.goto('/student/reviews');
    await expect(page).toHaveURL(/\/auth\/login$/);
  });
});
