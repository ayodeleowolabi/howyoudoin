const { test, expect } = require('./fixtures');

test('a student can add, edit, and remove contact info', async ({ studentPage: page }) => {
  await page.getByRole('link', { name: 'Contact info' }).click();
  await expect(page.getByTestId('empty-contact')).toBeVisible();

  await page.getByRole('link', { name: 'Add contact info' }).click();
  await page.getByLabel('Parent / guardian name').fill('Jane Doe');
  await page.getByLabel('Phone number').fill('202-555-0100');
  await page.getByLabel('Home address').fill('1 Main St');
  await page.getByLabel('Homeroom teacher').selectOption('Warner');
  await page.getByRole('button', { name: 'Save contact info' }).click();

  const card = page.getByTestId('contact-card');
  await expect(card).toContainText('Jane Doe');
  await expect(card).toContainText('Warner');

  await page.getByRole('link', { name: 'Edit contact info' }).click();
  await expect(page.getByLabel('Homeroom teacher')).toHaveValue('Warner');
  await page.getByLabel('Phone number').fill('202-555-0199');
  await page.getByRole('button', { name: 'Save changes' }).click();
  await expect(card).toContainText('202-555-0199');

  page.once('dialog', (dialog) => dialog.accept());
  await page.getByRole('button', { name: 'Remove' }).click();
  await expect(page.getByTestId('empty-contact')).toBeVisible();
});
