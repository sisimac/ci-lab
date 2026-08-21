import { test, expect } from '@playwright/test';

/**
 * Смоук-тесты — проверка развёрнутого сайта.
 *
 * Гоняются после деплоя по реальному адресу (BASE_URL).
 * Задача: убедиться, что приложение вообще доступно и живо.
 * Глубокую логику здесь не проверяем — для этого есть основные E2E.
 *
 * goto('./') — относительный путь. Со слешем '/' Playwright ушёл бы
 * в корень домена и потерял подпапку /ci-lab/.
 */

test('@smoke страница открывается и приложение на месте', async ({ page }) => {
  const response = await page.goto('./');

  // Сервер ответил успешно, а не 404 или 500
  expect(response?.status()).toBe(200);

  // Ключевые элементы интерфейса отрисовались
  await expect(page.getByPlaceholder('Что нужно сделать?')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Добавить' })).toBeVisible();
});

test('@smoke задачу можно добавить', async ({ page }) => {
  await page.goto('./');

  await page.getByPlaceholder('Что нужно сделать?').fill('Проверка после деплоя');
  await page.getByRole('button', { name: 'Добавить' }).click();

  await expect(page.getByText('Проверка после деплоя')).toBeVisible();
});
