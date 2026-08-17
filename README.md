# ci-lab

[![CI](https://github.com/sisimac/ci-lab/actions/workflows/playwright.yml/badge.svg)](https://github.com/sisimac/ci-lab/actions/workflows/playwright.yml)
[![Playwright](https://img.shields.io/badge/tested%20with-Playwright-2EAD33?logo=playwright&logoColor=white)](https://playwright.dev)
[![Deploy](https://img.shields.io/badge/deploy-GitHub%20Pages-222?logo=github)](https://sisimac.github.io/ci-lab/)

Учебный проект: полный CI/CD-цикл от коммита до продакшена на GitHub Actions.

**Демо:** [sisimac.github.io/ci-lab](https://sisimac.github.io/ci-lab/)

---

## О проекте

Небольшое веб-приложение «Список задач» служит объектом тестирования. Основная ценность репозитория — не само приложение, а пайплайн вокруг него: E2E-тесты в трёх браузерах, quality gates, блокирующие мёрдж, и деплой с ручным подтверждением релиза.

## Пайплайн

```
┌─────────┐   ┌─────────┐   ┌─────────┐   ┌──────────────┐
│ Линтер  │──▶│  Тесты  │──▶│ Сборка  │──▶│    Деплой    │
│   9s    │   │ 1m 12s  │   │   8s    │   │ ⏸ апрув      │
└─────────┘   └─────────┘   └─────────┘   └──────────────┘
   ESLint      Playwright     artifact     GitHub Pages
              3 браузера
```

Каждый этап зависит от предыдущего: падение линтера отменяет тесты, падение тестов отменяет сборку. Деплой запускается только при пуше в `main` и требует подтверждения ответственного.

## Что реализовано

**Тестирование**
- E2E-тесты Playwright: Chromium, Firefox, WebKit
- Локаторы по ролям и доступному имени — устойчивы к изменениям вёрстки
- Изоляция тестов: очистка состояния перед каждым прогоном
- Автозапуск приложения перед тестами через `webServer`
- Visual regression с пропуском в CI (рендеринг Linux ≠ macOS)
- HTML-отчёт и трейсы выгружаются артефактами, в том числе при падении

**CI/CD**
- Многоступенчатый пайплайн с зависимостями между этапами
- Branch protection: мёрдж в `main` блокируется при красных проверках
- Разделение окружений: PR проверяется, но не деплоится
- Environment `production` с обязательным апрувом и журналом деплоев
- Retry-политика: 2 повтора в CI, 0 локально
- Dependabot на GitHub Actions и npm-зависимости

## Стек

`Playwright` · `TypeScript` · `GitHub Actions` · `ESLint` · `GitHub Pages`

## Структура

```
app/                            приложение — объект тестирования
tests/todo.spec.ts              E2E-сценарии
playwright.config.ts            браузеры, webServer, отчёты, retry
.github/workflows/playwright.yml  пайплайн
.github/dependabot.yml          автообновление зависимостей
```

## Запуск локально

```bash
npm install
npx playwright install

npm run test:ui        # визуальный режим с таймлайном и трейсами
npm test               # прогон в терминале, три браузера
npm run report         # HTML-отчёт последнего прогона
```

Приложение поднимать отдельно не нужно — Playwright стартует его сам перед прогоном.

## Заметки

Браузеры устанавливаются внутрь проекта (`PLAYWRIGHT_BROWSERS_PATH=0`), а не в системный кэш — весь проект удаляется одной командой `rm -rf`.

Визуальный тест пропускается в CI: попиксельное сравнение чувствительно к различиям рендеринга между Linux и macOS. В продакшен-проектах такие проверки выносят в специализированные сервисы или запускают на фиксированном образе.
