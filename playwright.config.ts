import { defineConfig, devices } from '@playwright/test';

/**
 * Конфигурация Playwright.
 * Документация: https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  // Где лежат файлы тестов
  testDir: './tests',

  // Тесты внутри одного файла выполняются параллельно
  fullyParallel: true,

  // В CI запрещаем случайно закоммиченный test.only — иначе прогонится один тест вместо всех
  forbidOnly: !!process.env.CI,

  // В CI даём 2 повторные попытки упавшему тесту, локально — ноль
  retries: process.env.CI ? 2 : 0,

  // В CI один воркер (стабильнее), локально — по числу ядер
  workers: process.env.CI ? 1 : undefined,

  // HTML-отчёт. 'never' — не открывать браузер автоматически после прогона
  reporter: [['html', { open: 'never' }]],

  use: {
    // Базовый адрес: в тестах пишем page.goto('/') вместо полного URL
    baseURL: 'http://127.0.0.1:5173',

    // Записывать трейс при повторной попытке после падения
    trace: 'on-first-retry',

    // Скриншот только при падении
    screenshot: 'only-on-failure',
  },

  // Три браузерных движка — тест прогоняется в каждом
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ],

  /**
   * Playwright сам поднимает локальный сервер перед прогоном
   * и гасит его после. Работает одинаково на маке и в CI.
   */
  webServer: {
    command: 'npx --yes serve app -l 5173',
    url: 'http://127.0.0.1:5173',
    reuseExistingServer: !process.env.CI,
    timeout: 60 * 1000,
  },
});
