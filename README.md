# Task Tracker - Kanban Board

Приложение для управления задачами с drag-and-drop интерфейсом. Используется как демо-проект для изучения AI Developer Workflows (ADW).

## Возможности

- Создание задач с названием и описанием
- Перетаскивание задач между статусами (Todo → In Progress → Test → Done)
- Редактирование и удаление задач
- REST API для управления данными
- Drag-and-drop интерфейс

## Технологии

### Frontend
- React 18 + TypeScript
- Vite (сборщик)
- @dnd-kit (drag-and-drop)

### Backend
- Node.js + Express + TypeScript
- JSON файл для хранения данных
- REST API

## Prerequisites

- Node.js 18+
- `gh` GitHub CLI
- Anthropic API key (для ADW)

## Структура проекта

```
.
├── app/                    # Основное приложение
│   ├── client/             # React frontend
│   │   └── src/
│   │       ├── components/ # Компоненты (Board, Column, TaskCard)
│   │       └── App.tsx     # Главный компонент
│   │
│   ├── server/             # Express API сервер
│   │   └── src/
│   │       ├── routes/     # API маршруты
│   │       ├── data/       # tasks.json для хранения
│   │       └── index.ts    # Точка входа
│   │
│   ├── start.sh            # Скрипт запуска
│   └── stop.sh             # Скрипт остановки
│
├── adws/                   # AI Developer Workflows
│   ├── adw_plan_build.py   # Plan → Build workflow
│   ├── trigger_webhook.py  # Webhook триггер
│   ├── trigger_cron.py     # Cron триггер
│   └── health_check.py     # Проверка системы
│
├── .claude/
│   └── commands/           # Шаблоны для агентов
│       ├── feature.md      # /feature - планирование фич
│       ├── bug.md          # /bug - исправление багов
│       ├── chore.md        # /chore - рутинные задачи
│       └── implement.md    # /implement - реализация плана
│
├── scripts/                # Утилиты
├── specs/                  # Спецификации и планы
└── ai_docs/                # Документация AI/LLM
```

## Быстрый старт

### Автоматический запуск

```bash
cd app
./start.sh
```

- Backend: http://localhost:3001
- Frontend: http://localhost:3000

### Остановка

```bash
cd app
./stop.sh
```

### Ручной запуск

**Backend:**
```bash
cd app/server
npm install
npm run dev
```

**Frontend:**
```bash
cd app/client
npm install
npm run dev
```

## ADW - AI Developer Workflows

ADW позволяют автоматизировать разработку с помощью агентов.

### Запуск ADW

```bash
# Проверка системы
uv run adws/health_check.py <issue-number>

# Plan + Build workflow
uv run adws/adw_plan_build.py <issue-number>

# Webhook триггер (требует настройки)
uv run adws/trigger_webhook.py

# Cron триггер
uv run adws/trigger_cron.py
```

### Требования для ADW

Настройте переменные окружения в `.env`:

```bash
cp .env.sample .env
# Заполните значения
```

- `ANTHROPIC_API_KEY` - API ключ Anthropic
- `CLAUDE_CODE_PATH` - путь к Claude CLI
- `gh` CLI авторизован (`gh auth login`)

## API Endpoints

- `GET /api/tasks` - Получить все задачи
- `POST /api/tasks` - Создать задачу
- `PUT /api/tasks/:id` - Обновить задачу
- `DELETE /api/tasks/:id` - Удалить задачу

## Тестирование

```bash
# Backend тесты
cd app/server
npm test

# Frontend тесты (если настроены)
cd app/client
npm test
```

## Разработка

### Backend команды
```bash
cd app/server
npm run dev          # Запуск с hot reload
npm test             # Тесты
npm run build        # Сборка
```

### Frontend команды
```bash
cd app/client
npm run dev          # Запуск dev сервера
npm run build        # Сборка для продакшена
npm run preview      # Просмотр сборки
```

## Troubleshooting

**Backend не запускается:**
- Проверь Node.js: `node --version` (требуется 18+)
- Установи зависимости: `cd app/server && npm install`

**Frontend ошибки:**
- Очисти node_modules: `rm -rf node_modules && npm install`

**ADW не работает:**
- Проверь `gh auth status`
- Убедись что `.env` заполнен
