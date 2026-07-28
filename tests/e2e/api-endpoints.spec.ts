import { expect, test } from '@playwright/test';

test.describe('API endpoints', () => {
	test('reports the application health', async ({ request }) => {
		const response = await request.get('/actuator/health');

		await expect(response).toBeOK();
		expect(response.headers()['content-type']).toMatch(/json/);
		await expect(response.json()).resolves.toMatchObject({ status: 'UP' });
	});

	test('returns the list of veterinarians as JSON', async ({ request }) => {
		const response = await request.get('/vets');

		await expect(response).toBeOK();
		expect(response.headers()['content-type']).toMatch(/application\/json/);

		const body = await response.json();
		expect(body).toMatchObject({
			vetList: expect.arrayContaining([
				expect.objectContaining({
					firstName: expect.any(String),
					lastName: expect.any(String),
				}),
			]),
		});
	});
});
