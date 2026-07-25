import { expect, Page, test } from '@playwright/test';

type Owner = {
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  telephone: string;
};

function createOwnerData(testId: string): Owner {
  const suffix = `${testId}${Date.now()}`.slice(-16);

  return {
    firstName: 'E2E',
    lastName: `Tester${suffix}`,
    address: '123 Test Street',
    city: 'Testville',
    telephone: suffix.slice(-10),
  };
}

async function createOwner(page: Page, owner: Owner) {
  await page.goto('/owners/new');
  await page.getByLabel('First Name').fill(owner.firstName);
  await page.getByLabel('Last Name').fill(owner.lastName);
  await page.getByLabel('Address').fill(owner.address);
  await page.getByLabel('City').fill(owner.city);
  await page.getByLabel('Telephone').fill(owner.telephone);
  await page.getByRole('button', { name: 'Add Owner' }).click();

  await expect(page.getByRole('heading', { name: 'Owner Information' })).toBeVisible();
}

test.describe('owner management', () => {
  test('finds owners by last name', async ({ page }) => {
    await page.goto('/owners/find');
    await page.locator('#lastName').fill('Davis');
    await page.getByRole('button', { name: 'Find Owner' }).click();

    const results = page.locator('#owners');
    await expect(results).toBeVisible();
    await expect(results.getByRole('link', { name: 'Betty Davis' })).toBeVisible();
    await expect(results.getByRole('link', { name: 'Harold Davis' })).toBeVisible();
  });

  test('shows a helpful message when no owner matches a search', async ({ page }) => {
    await page.goto('/owners/find');
    await page.locator('#lastName').fill(`Nobody${Date.now()}`);
    await page.getByRole('button', { name: 'Find Owner' }).click();

    await expect(page.getByText('has not been found')).toBeVisible();
  });

  test('creates an owner and displays the saved details', async ({ page }, testInfo) => {
    const owner = createOwnerData(testInfo.testId);

    await createOwner(page, owner);

    await expect(page.getByText(`${owner.firstName} ${owner.lastName}`, { exact: true })).toBeVisible();
    await expect(page.getByText(owner.address, { exact: true })).toBeVisible();
    await expect(page.getByText(owner.telephone, { exact: true })).toBeVisible();
  });

  test('rejects an owner with an invalid telephone number', async ({ page }) => {
    await page.goto('/owners/new');
    await page.getByLabel('First Name').fill('E2E');
    await page.getByLabel('Last Name').fill('InvalidTelephone');
    await page.getByLabel('Address').fill('123 Test Street');
    await page.getByLabel('City').fill('Testville');
    await page.getByLabel('Telephone').fill('invalid');
    await page.getByRole('button', { name: 'Add Owner' }).click();

    await expect(page.getByText('Telephone must be a 10-digit number')).toBeVisible();
    await expect(page).toHaveURL(/\/owners\/new$/);
  });

  test('adds a pet to an owner', async ({ page }, testInfo) => {
    const owner = createOwnerData(testInfo.testId);
    const petName = `Pet${Date.now()}`;

    await createOwner(page, owner);
    await page.getByRole('link', { name: 'Add New Pet' }).click();
    await page.getByLabel('Name').fill(petName);
    await page.getByLabel('Birth Date').fill('2020-01-01');
    await page.getByLabel('Type').selectOption({ label: 'cat' });
    await page.getByRole('button', { name: 'Add Pet' }).click();

    await expect(page.getByRole('heading', { name: 'Owner Information' })).toBeVisible();
    await expect(page.getByText(petName, { exact: true })).toBeVisible();
    await expect(page.getByText('cat', { exact: true })).toBeVisible();
  });

  test('adds a future visit to an owner pet', async ({ page }, testInfo) => {
    const owner = createOwnerData(testInfo.testId);
    const petName = `Pet${Date.now()}`;
    const description = 'Routine E2E check-up';
    const tomorrow = new Date();

    tomorrow.setDate(tomorrow.getDate() + 1);

    await createOwner(page, owner);
    await page.getByRole('link', { name: 'Add New Pet' }).click();
    await page.getByLabel('Name').fill(petName);
    await page.getByLabel('Birth Date').fill('2020-01-01');
    await page.getByLabel('Type').selectOption({ label: 'dog' });
    await page.getByRole('button', { name: 'Add Pet' }).click();
    await page.getByRole('link', { name: 'Add Visit' }).click();
    await page.getByLabel('Date').fill(tomorrow.toISOString().slice(0, 10));
    await page.getByLabel('Description').fill(description);
    await page.getByRole('button', { name: 'Add Visit' }).click();

    await expect(page.getByRole('heading', { name: 'Owner Information' })).toBeVisible();
    await expect(page.getByText(description, { exact: true })).toBeVisible();
  });
});
