# Data model: Supabase/Postgres для платформы сайтов-приглашений

Этот документ описывает точную структуру данных для полной версии платформы: каталог шаблонов, заявки, клиенты, мероприятия, сайты клиентов, RSVP, файлы, оплаты, Instagram-контент и задачи AI/операционных агентов.

## 1. Цель модели

База должна поддерживать полный процесс:

```text
Клиент выбирает шаблон
  → заполняет бриф
  → создаётся заказ
  → владелец видит заказ в админке
  → данные превращаются в сайт-приглашение
  → сайт публикуется по slug
  → гости отправляют RSVP
  → владелец видит ответы и статус заказа
```

## 2. Рекомендуемый backend

- **Supabase Postgres** — основные данные.
- **Supabase Auth** — вход владельца/админов.
- **Supabase Storage** — фото, музыка, preview, файлы клиента.
- **Row Level Security** — защита клиентских данных.

На старте можно делать frontend на Astro, а Supabase подключать поэтапно.

---

## 3. Основные enum/status значения

### `event_type`

```text
wedding
nikah
kyz_uzatuu
birthday
baby_shower
jubilee
tushoo_toy
corporate
other
```

### `order_status`

```text
new
brief_received
missing_info
ready_to_build
building
preview_ready
client_review
revision_needed
waiting_payment
paid
published
completed
cancelled
```

### `payment_status`

```text
not_required
unpaid
partial
paid
refunded
cancelled
```

### `site_status`

```text
draft
preview
published
archived
```

### `asset_type`

```text
client_photo
music
video
template_preview
decoration
logo
map_image
other
```

### `agent_type`

```text
owner_admin
order_brief
template_design
qa_deploy
instagram_content
```

### `agent_task_status`

```text
queued
in_progress
needs_human
completed
failed
cancelled
```

---

## 4. Таблицы

## 4.1 `admin_profiles`

Профили владельцев/админов. Связаны с Supabase Auth.

| Поле | Тип | Обязательно | Описание |
|---|---:|---:|---|
| `id` | uuid pk | да | ID профиля |
| `auth_user_id` | uuid | да | ID пользователя из Supabase Auth |
| `full_name` | text | да | Имя владельца/админа |
| `role` | text | да | `owner`, `admin`, `editor` |
| `phone` | text | нет | Телефон |
| `instagram` | text | нет | Instagram |
| `created_at` | timestamptz | да | Дата создания |
| `updated_at` | timestamptz | да | Дата обновления |

Индексы:

- unique index по `auth_user_id`.

---

## 4.2 `template_categories`

Категории шаблонов.

| Поле | Тип | Обязательно | Описание |
|---|---:|---:|---|
| `id` | uuid pk | да | ID категории |
| `slug` | text | да | URL slug |
| `title` | text | да | Название |
| `description` | text | нет | Описание |
| `sort_order` | int | да | Порядок показа |
| `is_active` | boolean | да | Показывать в каталоге |
| `created_at` | timestamptz | да | Дата создания |

Примеры категорий:

- `wedding`
- `nikah`
- `kyz-uzatuu`
- `birthday`
- `baby-shower`
- `premium`
- `minimal`

---

## 4.3 `templates`

Каталог шаблонов.

| Поле | Тип | Обязательно | Описание |
|---|---:|---:|---|
| `id` | uuid pk | да | ID шаблона |
| `category_id` | uuid fk | нет | Основная категория |
| `slug` | text | да | URL slug, например `wedding-luxury-01` |
| `title` | text | да | Название шаблона |
| `subtitle` | text | нет | Короткое описание |
| `event_type` | text | да | Тип мероприятия |
| `style` | text | да | `luxury`, `minimal`, `traditional`, `kids`, etc. |
| `price_from` | numeric | нет | Цена от |
| `currency` | text | да | `KGS`, `KZT`, `USD`, etc. |
| `is_premium` | boolean | да | Premium шаблон или нет |
| `is_active` | boolean | да | Показывать в каталоге |
| `preview_image_url` | text | нет | Главное превью |
| `demo_url` | text | нет | Ссылка на демо |
| `sections` | jsonb | да | Секции шаблона |
| `colors` | jsonb | да | Палитры |
| `languages` | text[] | да | Поддерживаемые языки |
| `features` | jsonb | да | Музыка, RSVP, countdown, gallery |
| `sort_order` | int | да | Порядок показа |
| `created_at` | timestamptz | да | Дата создания |
| `updated_at` | timestamptz | да | Дата обновления |

Пример `features`:

```json
{
  "music": true,
  "rsvp": true,
  "countdown": true,
  "gallery": true,
  "map": true,
  "multi_language": false
}
```

---

## 4.4 `invitation_requests`

MVP-таблица для заявок из формы `/brief`. Она нужна до полной нормализации в `customers` + `orders` + `events`.

Файл миграции:

```text
supabase/migrations/20260710000000_initial_invitation_requests.sql
```

| Поле | Тип | Обязательно | Описание |
|---|---:|---:|---|
| `id` | uuid pk | да | Внутренний ID заявки |
| `request_number` | text unique | да | Номер для клиента/владельца, например `REQ-...` |
| `template_slug` | text | да | Выбранный шаблон |
| `template_select` | text | да | Значение из формы выбора шаблона |
| `package_preference` | text | нет | Предпочтение клиента: starter/standard/premium/not-sure |
| `client_name` | text | да | Имя клиента |
| `client_whatsapp` | text | да | WhatsApp/телефон |
| `event_type` | text | да | Тип события |
| `event_names` | text | да | Имена на приглашении |
| `event_date` | date | да | Дата события |
| `event_time` | text | нет | Время события |
| `venue` | text | нет | Название/адрес места одной строкой из текущего брифа |
| `invitation_text` | text | нет | Текст приглашения или пожелания |
| `language` | text | да | Язык приглашения |
| `rsvp_needed` | text | да | `yes`, `no`, `later` |
| `assets_note` | text | нет | Описание фото/музыки/материалов |
| `urgency` | text | да | `normal`, `fast`, `same-day` |
| `status` | text | да | Статус обработки заявки |
| `source` | text | да | Источник заявки, например `website` |
| `brief_payload` | jsonb | да | Полный исходный payload формы |
| `created_at` | timestamptz | да | Дата создания |
| `updated_at` | timestamptz | да | Дата обновления |

RLS для MVP:

- `anon` может только создавать заявку;
- `anon` не может читать чужие заявки;
- владелец управляет заявками через protected Edge Function `owner-requests` с service role key;
- service role key никогда не попадает в Astro/browser.

Позже данные из этой таблицы можно переносить/маппить в полную модель: `customers`, `orders`, `events`, `assets`.

---

## 4.4.1 `generated_sites`

MVP-таблица для постоянного хранения черновиков клиентских сайтов, собранных из заявок.

Файл миграции:

```text
supabase/migrations/20260710010000_generated_sites.sql
```

| Поле | Тип | Обязательно | Описание |
|---|---:|---:|---|
| `id` | uuid pk | да | Внутренний ID generated site |
| `request_number` | text fk | да | Ссылка на `invitation_requests.request_number` |
| `site_slug` | text unique | да | Будущий public slug, например `req-mrf61ebj` |
| `template_slug` | text | нет | Используемый шаблон |
| `status` | text | да | `draft`, `owner_preview`, `client_preview`, `published`, `archived` |
| `version` | integer | да | Версия generated site |
| `title` | text | нет | Заголовок preview |
| `draft_payload` | jsonb | да | Полный owner-side черновик сайта |
| `public_payload` | jsonb | нет | Будущая безопасная public-версия |
| `created_at` | timestamptz | да | Дата создания |
| `updated_at` | timestamptz | да | Дата обновления |
| `published_at` | timestamptz | нет | Когда опубликован |

RLS для MVP:

- RLS включён;
- public/anon не имеет policies для `SELECT`, `INSERT`, `UPDATE`, `DELETE`;
- чтение/запись делает только protected Edge Function `owner-requests` через service role;
- `/client-preview/?id=...` читает Supabase generated site только если в браузере владельца есть owner token;
- публичный доступ по slug будет добавлен отдельно через safe public payload/static build.

---

## 4.5 `customers`

Клиенты, которые делают заказы.

| Поле | Тип | Обязательно | Описание |
|---|---:|---:|---|
| `id` | uuid pk | да | ID клиента |
| `full_name` | text | да | Имя клиента |
| `phone` | text | нет | Телефон |
| `whatsapp` | text | нет | WhatsApp |
| `instagram` | text | нет | Instagram |
| `email` | text | нет | Email |
| `preferred_contact` | text | нет | `whatsapp`, `instagram`, `phone`, `email` |
| `notes` | text | нет | Заметки владельца |
| `created_at` | timestamptz | да | Дата создания |
| `updated_at` | timestamptz | да | Дата обновления |

Индексы:

- index по `phone`;
- index по `whatsapp`;
- index по `instagram`.

---

## 4.6 `orders`

Основная таблица заказов.

| Поле | Тип | Обязательно | Описание |
|---|---:|---:|---|
| `id` | uuid pk | да | ID заказа |
| `customer_id` | uuid fk | да | Клиент |
| `template_id` | uuid fk | нет | Выбранный шаблон |
| `status` | text | да | Статус заказа |
| `event_type` | text | да | Тип мероприятия |
| `package_name` | text | нет | `basic`, `standard`, `premium` |
| `price` | numeric | нет | Цена заказа |
| `currency` | text | да | Валюта |
| `payment_status` | text | да | Статус оплаты |
| `deadline` | date | нет | Дедлайн готовности |
| `source` | text | нет | `instagram`, `whatsapp`, `website`, `referral` |
| `internal_notes` | text | нет | Заметки владельца |
| `client_notes` | text | нет | Комментарий клиента |
| `created_at` | timestamptz | да | Дата создания |
| `updated_at` | timestamptz | да | Дата обновления |

Индексы:

- index по `status`;
- index по `customer_id`;
- index по `template_id`;
- index по `deadline`;
- index по `created_at`.

---

## 4.7 `events`

Данные самого мероприятия.

Один заказ обычно имеет одно мероприятие.

| Поле | Тип | Обязательно | Описание |
|---|---:|---:|---|
| `id` | uuid pk | да | ID event data |
| `order_id` | uuid fk | да | Заказ |
| `title` | text | нет | Название события |
| `primary_names` | text | да | Например `Асан & Айсулуу` |
| `host_names` | text | нет | Родители/организаторы |
| `event_date` | date | да | Дата |
| `event_time` | time | нет | Время начала |
| `timezone` | text | да | Например `Asia/Bishkek` |
| `venue_name` | text | нет | Название ресторана/места |
| `address` | text | нет | Адрес |
| `map_url` | text | нет | 2GIS/Google Maps |
| `program` | jsonb | нет | Программа дня |
| `dress_code` | text | нет | Dress code |
| `dress_code_colors` | jsonb | нет | Цвета dress code |
| `invitation_text` | text | нет | Основной текст приглашения |
| `language` | text | да | `ru`, `ky`, `kk`, `en` |
| `music_url` | text | нет | Музыка |
| `countdown_enabled` | boolean | да | Включить countdown |
| `rsvp_enabled` | boolean | да | Включить RSVP |
| `gallery_enabled` | boolean | да | Включить галерею |
| `raw_brief` | jsonb | нет | Исходные ответы формы |
| `created_at` | timestamptz | да | Дата создания |
| `updated_at` | timestamptz | да | Дата обновления |

Пример `program`:

```json
[
  { "time": "17:00", "title": "Сбор гостей" },
  { "time": "18:00", "title": "Начало торжества" },
  { "time": "23:00", "title": "Завершение" }
]
```

---

## 4.8 `invitation_sites`

Опубликованные или preview-сайты клиентов.

| Поле | Тип | Обязательно | Описание |
|---|---:|---:|---|
| `id` | uuid pk | да | ID сайта |
| `order_id` | uuid fk | да | Заказ |
| `template_id` | uuid fk | да | Используемый шаблон |
| `slug` | text | да | Public slug, например `asan-aisuluu` |
| `public_url` | text | нет | Полная публичная ссылка |
| `status` | text | да | `draft`, `preview`, `published`, `archived` |
| `version` | int | да | Версия сайта |
| `published_at` | timestamptz | нет | Когда опубликован |
| `expires_at` | timestamptz | нет | Если сайт временный |
| `settings` | jsonb | да | Настройки сайта |
| `created_at` | timestamptz | да | Дата создания |
| `updated_at` | timestamptz | да | Дата обновления |

Индексы:

- unique index по `slug`;
- index по `order_id`;
- index по `status`.

Пример `settings`:

```json
{
  "theme": "dark-gold",
  "show_order_cta": false,
  "password_protected": false,
  "analytics_enabled": true
}
```

---

## 4.9 `assets`

Файлы клиентов, шаблонов и сайта.

| Поле | Тип | Обязательно | Описание |
|---|---:|---:|---|
| `id` | uuid pk | да | ID файла |
| `order_id` | uuid fk | нет | Если файл относится к заказу |
| `template_id` | uuid fk | нет | Если файл относится к шаблону |
| `invitation_site_id` | uuid fk | нет | Если файл относится к сайту |
| `type` | text | да | Тип файла |
| `bucket` | text | да | Supabase bucket |
| `storage_path` | text | да | Путь в Storage |
| `public_url` | text | нет | Публичная ссылка, если разрешено |
| `original_filename` | text | нет | Оригинальное имя файла |
| `mime_type` | text | нет | MIME type |
| `size_bytes` | bigint | нет | Размер |
| `alt_text` | text | нет | Alt для изображений |
| `source` | text | нет | `client_upload`, `unsplash`, `pexels`, `generated`, `purchased` |
| `license_note` | text | нет | Заметка по лицензии |
| `sort_order` | int | да | Порядок показа |
| `created_at` | timestamptz | да | Дата создания |

Индексы:

- index по `order_id`;
- index по `template_id`;
- index по `invitation_site_id`;
- index по `type`.

---

## 4.10 `rsvp_responses`

Ответы гостей.

| Поле | Тип | Обязательно | Описание |
|---|---:|---:|---|
| `id` | uuid pk | да | ID ответа |
| `invitation_site_id` | uuid fk | да | Сайт приглашения |
| `guest_name` | text | да | Имя гостя |
| `phone` | text | нет | Телефон |
| `attending` | boolean | да | Придёт или нет |
| `guest_count` | int | да | Количество людей |
| `message` | text | нет | Комментарий |
| `food_preference` | text | нет | Опционально |
| `created_at` | timestamptz | да | Дата ответа |

Индексы:

- index по `invitation_site_id`;
- index по `created_at`.

---

## 4.11 `payments`

Оплаты по заказу.

| Поле | Тип | Обязательно | Описание |
|---|---:|---:|---|
| `id` | uuid pk | да | ID оплаты |
| `order_id` | uuid fk | да | Заказ |
| `amount` | numeric | да | Сумма |
| `currency` | text | да | Валюта |
| `status` | text | да | Статус оплаты |
| `method` | text | нет | `cash`, `bank_transfer`, `card`, `mbank`, etc. |
| `provider` | text | нет | Платёжный провайдер, если есть |
| `provider_payment_id` | text | нет | ID оплаты у провайдера |
| `paid_at` | timestamptz | нет | Дата оплаты |
| `notes` | text | нет | Заметки |
| `created_at` | timestamptz | да | Дата создания |

Индексы:

- index по `order_id`;
- index по `status`.

---

## 4.12 `activity_log`

История действий по заказам и сайтам.

| Поле | Тип | Обязательно | Описание |
|---|---:|---:|---|
| `id` | uuid pk | да | ID записи |
| `order_id` | uuid fk | нет | Заказ |
| `invitation_site_id` | uuid fk | нет | Сайт |
| `actor_type` | text | да | `admin`, `customer`, `guest`, `agent`, `system` |
| `actor_id` | uuid | нет | ID пользователя/агента |
| `action` | text | да | Что произошло |
| `details` | jsonb | нет | Детали |
| `created_at` | timestamptz | да | Дата |

Примеры действий:

- `order_created`
- `status_changed`
- `brief_updated`
- `site_preview_created`
- `site_published`
- `rsvp_received`
- `payment_received`
- `agent_task_completed`

---

## 4.13 `instagram_posts`

Контент для Instagram.

| Поле | Тип | Обязательно | Описание |
|---|---:|---:|---|
| `id` | uuid pk | да | ID поста |
| `related_template_id` | uuid fk | нет | Шаблон, если пост про шаблон |
| `related_order_id` | uuid fk | нет | Заказ, если пост про кейс |
| `post_type` | text | да | `post`, `story`, `reel`, `carousel` |
| `topic` | text | да | Тема |
| `caption` | text | нет | Текст поста |
| `visual_idea` | text | нет | Идея визуала |
| `cta` | text | нет | Призыв к действию |
| `hashtags` | text[] | нет | Хэштеги |
| `status` | text | да | `idea`, `draft`, `ready`, `posted`, `cancelled` |
| `scheduled_for` | timestamptz | нет | Запланировано на |
| `published_url` | text | нет | Ссылка после публикации |
| `created_at` | timestamptz | да | Дата создания |
| `updated_at` | timestamptz | да | Дата обновления |

---

## 4.14 `agent_tasks`

Задачи для AI/операционных агентов.

| Поле | Тип | Обязательно | Описание |
|---|---:|---:|---|
| `id` | uuid pk | да | ID задачи |
| `agent_type` | text | да | Тип агента |
| `order_id` | uuid fk | нет | Связанный заказ |
| `template_id` | uuid fk | нет | Связанный шаблон |
| `invitation_site_id` | uuid fk | нет | Связанный сайт |
| `status` | text | да | Статус задачи |
| `title` | text | да | Название задачи |
| `input` | jsonb | нет | Входные данные |
| `output` | jsonb | нет | Результат |
| `error_message` | text | нет | Ошибка, если есть |
| `created_by` | uuid | нет | Кто создал |
| `created_at` | timestamptz | да | Дата создания |
| `started_at` | timestamptz | нет | Дата старта |
| `completed_at` | timestamptz | нет | Дата завершения |

Примеры задач:

- проверить бриф;
- найти недостающие данные;
- подготовить текст приглашения;
- подготовить Instagram caption;
- проверить сайт перед публикацией;
- создать список правок.

---

## 5. Связи между таблицами

```text
customers
  └── orders
        ├── events
        ├── payments
        ├── assets
        ├── activity_log
        ├── agent_tasks
        └── invitation_sites
                ├── rsvp_responses
                └── assets

template_categories
  └── templates
        ├── orders
        ├── invitation_sites
        ├── assets
        └── instagram_posts
```

Главная логика:

- `customers` — кто заказал.
- `orders` — коммерческая заявка.
- `events` — данные мероприятия.
- `templates` — из чего собираем сайт.
- `invitation_sites` — опубликованный/preview сайт.
- `assets` — файлы.
- `rsvp_responses` — ответы гостей.
- `activity_log` — история.
- `agent_tasks` — помощь AI/операционных агентов.

---

## 6. Supabase Storage buckets

### `template-assets`

Для файлов шаблонов:

- preview images;
- decorative assets;
- demo screenshots;
- template music placeholders.

Public read: да.
Admin write: да.

### `client-uploads`

Для файлов клиентов:

- фото пары;
- музыка;
- видео;
- дополнительные изображения.

Public read: нет по умолчанию.
Admin/customer upload: да через signed upload.

### `published-sites`

Для файлов, которые можно показывать на опубликованном сайте:

- optimized photos;
- public music;
- generated preview images.

Public read: да, если сайт опубликован.
Admin write: да.

### `private-documents`

Для приватных документов:

- договоры;
- чеки;
- внутренние файлы.

Public read: нет.
Admin only.

---

## 7. RLS / безопасность

На старте можно сделать просто: только владелец входит в админку.

### Правила

1. Публичный пользователь может читать только:
   - активные шаблоны;
   - опубликованные сайты;
   - публичные assets опубликованного сайта.

2. Гость может создавать:
   - `rsvp_responses` для опубликованного сайта.

3. Клиент может создавать:
   - заказ через публичную форму;
   - загрузку файлов через signed upload.

4. Админ/владелец может:
   - читать всё;
   - редактировать заказы;
   - публиковать сайты;
   - менять статусы;
   - видеть RSVP;
   - создавать agent tasks.

5. Нельзя публично отдавать:
   - все заказы;
   - телефоны клиентов;
   - приватные фото до публикации;
   - внутренние заметки;
   - оплаты.

---

## 8. MVP версия без сложной админки

Чтобы быстрее двигаться, можно сделать поэтапно.

### MVP data flow

```text
Astro catalog
  → order form
  → Supabase orders/customers/events
  → владелец смотрит заявки в Supabase dashboard
  → сайт клиента пока собирается вручную/полуавтоматически
```

### MVP таблицы минимум

Для первого рабочего backend нужны только:

1. `templates`
2. `customers`
3. `orders`
4. `events`
5. `assets`
6. `invitation_sites`
7. `rsvp_responses`

Позже добавить:

- `payments`
- `activity_log`
- `instagram_posts`
- `agent_tasks`
- полноценную админку.

---

## 9. Что нужно реализовать в коде первым

### Шаг 1

Создать локальные TypeScript-типы, чтобы frontend уже работал как будущая база:

- `Template`
- `Customer`
- `Order`
- `EventDetails`
- `InvitationSite`
- `Asset`
- `RsvpResponse`

### Шаг 2

Перевести каталог шаблонов на data-driven структуру:

```text
src/data/templates.ts
```

### Шаг 3

Сделать кнопку заказа:

```text
/templates/wedding-luxury-01/
  → /order/?template=wedding-luxury-01
```

### Шаг 4

Сделать форму заказа, которая собирает данные по этой модели.

### Шаг 5

Позже подключить Supabase insert в таблицы:

- `customers`
- `orders`
- `events`

---

## 10. Следующий документ после этого

После `data-model.md` нужно создать:

```text
docs/owner-workflow.md
```

Там описать простыми словами:

- как владелец принимает заказ;
- как проверяет данные;
- как создаёт сайт;
- как отправляет ссылку;
- что делать, если не хватает информации;
- какие статусы менять.

---

## 11. Итог

Эта модель даёт основу для полноценной платформы:

- каталог шаблонов;
- заявки;
- клиенты;
- данные мероприятий;
- файлы;
- опубликованные сайты;
- RSVP;
- оплаты;
- Instagram-контент;
- agent tasks;
- админка владельца.

Главное правило: сначала строим данные и workflow, потом поверх этого делаем красивые страницы и автоматизацию.


## Public generated invitation links

`public.generated_sites` keeps two separate payloads:

- `draft_payload` — private owner/admin draft. May contain internal notes or source details and is only read through the protected Owner API.
- `public_payload` — cleaned client-facing invitation content. This is created server-side when the owner clicks “Отправить клиенту”.

Public client links use:

```text
/i/<site_slug>/
GET /functions/v1/owner-requests?public_site=<site_slug>
```

The public read path does not require owner token, but it only returns `public_payload` for public statuses such as `preview_sent`/`published`. Raw request rows, phone numbers, owner notes, and service-role access stay private.
