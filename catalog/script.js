const catalogs = [
  {
    id: 'wedding',
    title: 'Свадебные приглашения',
    description: 'Luxury, minimal и photo-story сайты для свадьбы: дата, программа, карта, RSVP и dress-code.',
    icon: '💍',
    status: 'ready',
    accent: '#c9a35f'
  },
  {
    id: 'nikah',
    title: 'Никах',
    description: 'Элегантные и спокойные шаблоны для никаха с уважительным текстом, адресом и анкетой гостей.',
    icon: '🕌',
    status: 'ready',
    accent: '#8fb39b'
  },
  {
    id: 'kyz-uzatuu',
    title: 'Кыз Узатуу',
    description: 'Отдельный культурный каталог: тёплый стиль, программа, семья/родители, карта и RSVP.',
    icon: '🌺',
    status: 'soon',
    accent: '#b85f66'
  },
  {
    id: 'birthday',
    title: 'День рождения',
    description: 'Яркие приглашения для дня рождения, детских праздников и вечеринок.',
    icon: '🎂',
    status: 'ready',
    accent: '#e0a24d'
  },
  {
    id: 'baby-shower',
    title: 'Baby Shower',
    description: 'Нежные сайты для baby shower: дата, место, пожелания, дресс-код и RSVP.',
    icon: '🧸',
    status: 'ready',
    accent: '#9bbad8'
  },
  {
    id: 'jubilee',
    title: 'Юбилей / Тушоо той',
    description: 'Будущий каталог для юбилеев, тушоо той и семейных мероприятий.',
    icon: '✨',
    status: 'soon',
    accent: '#9b7cc1'
  }
];

const templates = [
  {
    name: 'Wedding Luxury 01',
    category: 'wedding',
    label: 'Свадьба',
    description: 'Премиальный бело-золотой свадебный шаблон.',
    url: '../templates/wedding-luxury-01/index.html'
  },
  {
    name: 'Wedding Minimal 01',
    category: 'wedding',
    label: 'Свадьба',
    description: 'Чистый минималистичный шаблон для современной свадьбы.',
    url: '../templates/wedding-minimal-01/index.html'
  },
  {
    name: 'Nikah Elegant 01',
    category: 'nikah',
    label: 'Никах',
    description: 'Спокойный и элегантный шаблон для никаха.',
    url: '../templates/nikah-elegant-01/index.html'
  },
  {
    name: 'Birthday Party 01',
    category: 'birthday',
    label: 'День рождения',
    description: 'Праздничный шаблон для дня рождения.',
    url: '../templates/birthday-party-01/index.html'
  },
  {
    name: 'Baby Shower 01',
    category: 'baby-shower',
    label: 'Baby Shower',
    description: 'Нежный шаблон для baby shower.',
    url: '../templates/baby-shower-01/index.html'
  }
];

const statusText = {
  ready: 'Есть шаблоны',
  soon: 'Скоро добавим'
};

const catalogGrid = document.getElementById('catalogGrid');
const filterBar = document.getElementById('filterBar');
const templateGrid = document.getElementById('templateGrid');

function renderCatalogs() {
  catalogGrid.innerHTML = catalogs.map(catalog => {
    const count = templates.filter(template => template.category === catalog.id).length;
    const statusClass = catalog.status === 'ready' ? 'status ready' : 'status';

    return `
      <article class="catalog-card" style="--accent:${catalog.accent}">
        <div class="catalog-icon" aria-hidden="true">${catalog.icon}</div>
        <span class="${statusClass}">${statusText[catalog.status]}</span>
        <h3>${catalog.title}</h3>
        <p>${catalog.description}</p>
        <p><strong>${count}</strong> шаблон(ов) сейчас</p>
        <div class="actions">
          <a href="#templates" data-filter-link="${catalog.id}">Открыть</a>
          <a class="ghost" href="../docs/client-brief.md">Заказать</a>
        </div>
      </article>
    `;
  }).join('');
}

function renderFilters(activeCategory = 'all') {
  const options = [
    { id: 'all', title: 'Все' },
    ...catalogs.map(catalog => ({ id: catalog.id, title: catalog.title }))
  ];

  filterBar.innerHTML = options.map(option => `
    <button class="filter-button ${option.id === activeCategory ? 'active' : ''}" data-filter="${option.id}">
      ${option.title}
    </button>
  `).join('');
}

function renderTemplates(activeCategory = 'all') {
  const visibleTemplates = activeCategory === 'all'
    ? templates
    : templates.filter(template => template.category === activeCategory);

  if (!visibleTemplates.length) {
    templateGrid.innerHTML = `
      <article class="template-card">
        <p class="category">Скоро</p>
        <h3>В этом разделе пока нет шаблонов</h3>
        <p>Мы добавим сюда свои дизайны позже. Сейчас можно заказать индивидуальный вариант.</p>
        <div class="actions">
          <a href="../docs/client-brief.md">Заказать дизайн</a>
        </div>
      </article>
    `;
    return;
  }

  templateGrid.innerHTML = visibleTemplates.map(template => `
    <article class="template-card">
      <p class="category">${template.label}</p>
      <h3>${template.name}</h3>
      <p>${template.description}</p>
      <div class="actions">
        <a href="${template.url}">Посмотреть</a>
        <a class="secondary" href="../docs/client-brief.md">Заказать</a>
      </div>
    </article>
  `).join('');
}

function setActiveCategory(category) {
  renderFilters(category);
  renderTemplates(category);
}

renderCatalogs();
setActiveCategory('all');

filterBar.addEventListener('click', event => {
  const button = event.target.closest('[data-filter]');
  if (!button) return;
  setActiveCategory(button.dataset.filter);
});

catalogGrid.addEventListener('click', event => {
  const link = event.target.closest('[data-filter-link]');
  if (!link) return;
  setActiveCategory(link.dataset.filterLink);
});
