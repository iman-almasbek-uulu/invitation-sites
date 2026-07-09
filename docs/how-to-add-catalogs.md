# Как добавлять новые каталоги и шаблоны

Этот проект сделан так, чтобы мы могли постепенно расширять каталог.

## Где главный каталог

```text
catalog/index.html
catalog/styles.css
catalog/script.js
```

Главная логика находится здесь:

```text
catalog/script.js
```

## Как добавить новый каталог

Открой `catalog/script.js` и добавь новый объект в массив `catalogs`:

```js
{
  id: 'engagement',
  title: 'Помолвка',
  description: 'Шаблоны для помолвки и семейных мероприятий.',
  icon: '💐',
  status: 'soon',
  accent: '#c98ca7'
}
```

Поля:

| Поле | Что значит |
|---|---|
| `id` | короткое имя категории, без пробелов |
| `title` | название, которое видит клиент |
| `description` | описание каталога |
| `icon` | emoji-иконка |
| `status` | `ready` или `soon` |
| `accent` | цвет карточки |

## Как добавить новый шаблон

1. Создай папку:

```text
templates/new-template-name/
```

2. Внутри должны быть файлы:

```text
index.html
styles.css
script.js
data.json
```

3. Добавь карточку в массив `templates` в `catalog/script.js`:

```js
{
  name: 'Engagement Soft 01',
  category: 'engagement',
  label: 'Помолвка',
  description: 'Нежный шаблон для помолвки.',
  url: '../templates/engagement-soft-01/index.html'
}
```

Важно: `category` должен совпадать с `id` каталога.

## Текущие категории

- `wedding` — свадьба
- `nikah` — никах
- `kyz-uzatuu` — кыз узатуу
- `birthday` — день рождения
- `baby-shower` — baby shower
- `jubilee` — юбилей / тушоо той

## Правило

Мы можем смотреть чужие сайты как референсы, но не копируем чужой код, тексты, фото, брендинг или дизайн 1-в-1.
