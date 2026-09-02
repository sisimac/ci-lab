import { test, expect } from '@playwright/test';

/**
 * Тесты списка задач.
 *
 * Стиль — «плоский»: все обращения к элементам написаны прямо внутри тестов.
 * Так проще читать на старте. На следующем шаге вынесем их в Page Object.
 */

// beforeEach выполняется перед каждым тестом в этом файле.
// Открываем страницу и чистим localStorage, чтобы тесты не влияли друг на друга.
test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
});

test('на старте список пуст', async ({ page }) => {
  // getByText находит элемент по видимому тексту — так же, как его видит пользователь
  await expect(page.getByText('Задач пока нет')).toBeVisible();
  await expect(page.getByText('Активных задач: 0')).toBeVisible();
});

test('добавленная задача появляется в списке', async ({ page }) => {
  // getByPlaceholder — поиск поля по подсказке внутри него
  await page.getByPlaceholder('Что нужно сделать?').fill('Купить хлеб');

  // getByRole — самый устойчивый способ: ищем по роли элемента и его названию.
  // Переедет вёрстка или поменяются классы — тест продолжит работать.
  await page.getByRole('button', { name: 'Добавить' }).click();

  await expect(page.getByText('Купить хлеб')).toBeVisible();
  await expect(page.getByText('Активных задач: 1')).toBeVisible();

  // Заглушка про пустой список должна исчезнуть
  await expect(page.getByText('Задач пока нет')).toBeHidden();
});

test('отметка выполнения уменьшает счётчик активных', async ({ page }) => {
  await page.getByPlaceholder('Что нужно сделать?').fill('Позвонить в банк');

  // Enter вместо клика — проверяем второй способ добавления
  await page.getByPlaceholder('Что нужно сделать?').press('Enter');

  await expect(page.getByText('Активных задач: 1')).toBeVisible();

  // aria-label у чекбокса задан в приложении — по нему и находим нужный
  await page.getByLabel('Выполнено: Позвонить в банк').check();

  await expect(page.getByText('Активных задач: 0')).toBeVisible();
});

test('задачу можно удалить', async ({ page }) => {
  await page.getByPlaceholder('Что нужно сделать?').fill('Забрать посылку');
  await page.getByRole('button', { name: 'Добавить' }).click();
  await expect(page.getByText('Забрать посылку')).toBeVisible();

  await page.getByRole('button', { name: 'Удалить: Забрать посылку' }).click();

  await expect(page.getByText('Забрать посылку')).toBeHidden();
  await expect(page.getByText('Задач пока нет')).toBeVisible();
});

test('задачи сохраняются после перезагрузки страницы', async ({ page }) => {
  await page.getByPlaceholder('Что нужно сделать?').fill('Сдать отчёт');
  await page.getByRole('button', { name: 'Добавить' }).click();

  await page.reload();

  await expect(page.getByText('Сдать отчёт')).toBeVisible();
  await expect(page.getByText('Активных задач: 1')).toBeVisible();
});

test('кнопка удаляет только выполненные задачи', async ({ page }) => {
  // Подготовка: создаём две задачи
  await page.getByPlaceholder('Что нужно сделать?').fill('Задача раз');
  await page.getByRole('button', { name: 'Добавить' }).click();
  await page.getByPlaceholder('Что нужно сделать?').fill('Задача два');
  await page.getByRole('button', { name: 'Добавить' }).click();

  // Действие: отмечаем первую выполненной и жмём очистку
  await page.getByLabel('Выполнено: Задача раз').check();
  await page.getByRole('button', { name: 'Удалить выполненные' }).click();

  // Проверка: выполненная исчезла, активная осталась
  await expect(page.getByText('Задача раз')).toBeHidden();
  await expect(page.getByText('Задача два')).toBeVisible();
});

test('внешний вид не изменился', async ({ page }) => {
  test.skip(!!process.env.CI, 'Визуальные тесты гоняем только локально: рендеринг в Linux отличается от macOS');
  await expect(page).toHaveScreenshot('empty-list.png');
});

test('счётчик обновляется после добавления задачи', async ({ page }) => {
  // Так ведёт себя настоящий интерфейс, который ждёт ответа сервера.
  await page.evaluate(() => {
    const original = window['render'];
    // Половина прогонов — перерисовка мгновенная, половина — с задержкой в две секунды.
    // Вероятность задана числом, а не таймингом, поэтому от скорости машины не зависит.
    window['render'] = () => setTimeout(original, Math.random() < 0.5 ? 0 : 2000);
  });

  await page.getByPlaceholder('Что нужно сделать?').fill('Задача с задержкой');
  await page.getByRole('button', { name: 'Добавить' }).click();

  // Две ошибки разом, обе встречаются в реальных проектах:
  // 1) фиксированная пауза вместо ожидания события — «50 мс должно хватить»;
  // 2) textContent читается ровно один раз, без повторных попыток.
  await page.waitForTimeout(50);
  const text = await page.locator('#counter').textContent();
  expect(text).toBe('Активных задач: 1');
});
