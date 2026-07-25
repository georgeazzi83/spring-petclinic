import { expect, test } from '@playwright/test';

test('displays the Petclinic welcome page', async ({ page }) => {
  await page.goto('/');

  await expect(page).toHaveTitle(/PetClinic/);
  await expect(page.getByRole('heading', { name: 'Welcome' })).toBeVisible();
});
