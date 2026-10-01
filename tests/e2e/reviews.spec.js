const { test, expect, createReview, signUp } = require('./fixtures');

test.describe('Weekly reviews', () => {
  test('shows an empty state for a new student', async ({ studentPage: page }) => {
    await page.getByRole('link', { name: 'Weekly reviews' }).click();
    await expect(page.getByTestId('empty-reviews')).toContainText('You have no reviews yet');
  });

  test('a student can create a review and see it in the list', async ({ studentPage: page }) => {
    await createReview(page, { week: 'Week 2', score: 4, note: 'Feeling great about slope!' });

    await expect(page).toHaveURL(/\/student\/reviews$/);
    const card = page.getByTestId('review-card').filter({ hasText: 'Week 2' });
    await expect(card).toBeVisible();
    await expect(card.getByTestId('rating-chip')).toHaveText('4 / 4');
    await expect(card).toContainText('Feeling great about slope!');
  });

  test('editing the note keeps the original rating (BUG-04)', async ({ studentPage: page }) => {
    await createReview(page, { score: 4, note: 'first draft' });
    await page.getByTestId('review-card').first().click();
    await page.getByRole('link', { name: 'Edit review' }).click();

    await page.getByLabel('Tell me more').fill('second draft');
    await page.getByRole('button', { name: 'Save changes' }).click();

    await expect(page.getByTestId('reflection')).toHaveText('second draft');
    await expect(page.getByTestId('rating-chip')).toHaveText('4 / 4');
  });

  test('a student can delete a review', async ({ studentPage: page }) => {
    await createReview(page, { note: 'delete me' });
    await page.getByTestId('review-card').first().click();
    page.once('dialog', (dialog) => dialog.accept());
    await page.getByRole('button', { name: 'Delete review' }).click();
    await expect(page.getByTestId('empty-reviews')).toBeVisible();
  });

  test('the dashboard counts submitted reviews', async ({ studentPage: page }) => {
    await createReview(page, { week: 'Week 1' });
    await createReview(page, { week: 'Week 2' });
    await page.goto('/');
    await expect(page.getByTestId('review-count')).toHaveText('2');
  });

  test('another student cannot open my review by URL (BUG-01)', async ({ browser }) => {
    const aliceCtx = await browser.newContext();
    const alice = await aliceCtx.newPage();
    await signUp(alice);
    await createReview(alice, { note: 'only for me' });
    await alice.getByTestId('review-card').first().click();
    const reviewUrl = alice.url();

    const bobCtx = await browser.newContext();
    const bob = await bobCtx.newPage();
    await signUp(bob);
    await bob.goto(reviewUrl);
    await expect(bob.getByRole('heading', { name: 'Page not found' })).toBeVisible();
    await expect(bob.getByText('only for me')).toHaveCount(0);

    await aliceCtx.close();
    await bobCtx.close();
  });
});
