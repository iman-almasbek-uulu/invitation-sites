# Client site generator workflow

## Что уже есть в MVP

Админка умеет собрать первый черновик клиентского сайта из заявки:

```text
/admin/requests/
→ кнопка “Собрать черновик сайта”
→ GeneratedClientSite draft
→ /client-preview/?id=<request_id>
→ preview-страница показывает данные события и секции сайта
```

## Server-side хранение

Для реальных Supabase-заявок черновик теперь сохраняется через protected Owner API:

```text
/admin/requests/
→ buildClientSiteDraft(request)
→ POST /functions/v1/owner-requests
→ public.generated_sites
→ status generated site: owner_preview
→ request status: in_progress
```

Для local/demo заявок остаётся fallback:

```text
localStorage: generated_invitation_site_<request_id>
```

Это важно для smoke-тестов и разработки без Supabase.

## Таблица

Миграция:

```text
supabase/migrations/20260710010000_generated_sites.sql
```

Основные поля:

| Поле | Зачем |
|---|---|
| `request_number` | связь с `invitation_requests.request_number` |
| `site_slug` | будущий public slug |
| `status` | `draft`, `owner_preview`, `client_preview`, `published`, `archived` |
| `template_slug` | какой шаблон используется |
| `title` | название preview |
| `draft_payload` | полный owner-side JSON черновика |
| `public_payload` | будущая безопасная public-версия без owner notes |

## Owner API

Сохранение черновика:

```http
POST /functions/v1/owner-requests
x-owner-token: <OWNER_API_TOKEN>
content-type: application/json
```

```json
{
  "action": "upsert_generated_site",
  "request_number": "REQ-...",
  "draft": { "...": "GeneratedClientSite" }
}
```

Чтение черновика для owner preview:

```http
GET /functions/v1/owner-requests?generated_site=REQ-...
x-owner-token: <OWNER_API_TOKEN>
```

## Что попадает в черновик

- ID заявки
- выбранный шаблон
- пакет
- имя клиента
- тип события
- имена на приглашении
- дата и время
- локация
- текст приглашения
- RSVP-настройка
- список секций сайта
- next steps для владельца

## Текущее ограничение

`/client-preview/?id=...` пока является owner preview:

- если owner token есть — пробует читать Supabase `generated_sites`;
- если backend недоступен — показывает localStorage fallback;
- публичная клиентская ссылка ещё не включена.

То есть сейчас:

```text
✅ заявка → черновик сайта → generated_sites → owner preview
✅ fallback без Supabase через localStorage
❌ публичный safe URL для клиента без owner token
```

## Следующий production-шаг

```text
generated_sites.public_payload
→ public-safe Edge Function / static build
→ /i/<slug> или отдельный клиентский URL
→ кнопка “Отправить preview клиенту”
→ status: preview_sent
```

## Проверка

Локальный smoke-тест:

```bash
BASE_URL=http://localhost:4339/invitation-sites npm run smoke:generator
```

Ожидаемый результат:

- черновик сохранён в localStorage fallback;
- `/client-preview/?id=...` открывается;
- preview state = `ready`;
- есть 6 секций;
- есть next steps для владельца.

Owner API verification:

```bash
npm run verify:owner-api
```

Ожидаемый результат:

- list заявок работает;
- status PATCH работает;
- generated site POST/read работает, если миграция и функция задеплоены.
