import { expect, test } from '@playwright/test';

test('displays the Petclinic welcome page', async ({ page }) => {
  await page.goto('/');

  await expect(page).toHaveTitle(/PetClinic/);

  // This line ensures that a heading element with the text "Welcome" is visible on the page
  await expect(page.getByRole('heading', { name: 'Welcome' })).toBeVisible();
});
