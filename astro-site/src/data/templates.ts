export type EventCategory =
  | 'wedding'
  | 'nikah'
  | 'kyz-uzatuu'
  | 'birthday'
  | 'baby-shower'
  | 'jubilee';

export type TemplateStyle = 'luxury' | 'minimal' | 'elegant' | 'party' | 'soft' | 'traditional';

export type PackageLevel = 'starter' | 'standard' | 'premium';

export type InvitationTemplate = {
  slug: string;
  name: string;
  title: string;
  category: EventCategory;
  label: string;
  description: string;
  style: TemplateStyle;
  packageLevel: PackageLevel;
  priceRange: string;
  previewImage: string;
  demoPath: string;
  tags: string[];
  features: string[];
  recommendedUse: string;
  isReady: boolean;
};

export const templates = [
  {
    slug: 'wedding-luxury-01',
    name: 'Wedding Luxury 01',
    title: 'Luxury wedding invitation with royal envelope',
    category: 'wedding',
    label: 'Свадьба',
    description: 'Премиальный тёмно-золотой свадебный шаблон с конвертом, анимацией, галереей, программой, картой и RSVP.',
    style: 'luxury',
    packageLevel: 'premium',
    priceRange: 'Premium',
    previewImage: '/assets/luxury/couple-muslim.jpg',
    demoPath: '/templates/wedding-luxury-01/',
    tags: ['luxury', 'gold', 'dark', 'envelope', 'premium', 'wedding'],
    features: ['Открывающийся конверт', 'Музыка', 'Countdown', 'Программа дня', 'Галерея', 'RSVP', 'Карта'],
    recommendedUse: 'Премиальные свадьбы, никах/той в luxury стиле, клиенты с хорошими фото и высоким бюджетом.',
    isReady: true,
  },
  {
    slug: 'wedding-minimal-01',
    name: 'Wedding Minimal 01',
    title: 'Minimal modern wedding invitation',
    category: 'wedding',
    label: 'Свадьба',
    description: 'Чистый минималистичный шаблон для современной свадьбы: имена, дата, локация, программа и RSVP.',
    style: 'minimal',
    packageLevel: 'starter',
    priceRange: 'Starter',
    previewImage: '/assets/placeholders/wedding-minimal.jpg',
    demoPath: '/templates/wedding-minimal-01/',
    tags: ['minimal', 'modern', 'clean', 'wedding'],
    features: ['Hero', 'Дата', 'Локация', 'Программа', 'RSVP'],
    recommendedUse: 'Быстрые заказы, спокойный современный стиль, когда клиент хочет аккуратно и без тяжёлой анимации.',
    isReady: true,
  },
  {
    slug: 'nikah-elegant-01',
    name: 'Nikah Elegant 01',
    title: 'Elegant nikah invitation',
    category: 'nikah',
    label: 'Никах',
    description: 'Спокойный и элегантный шаблон для никаха с уважительным текстом, временем, адресом и RSVP.',
    style: 'elegant',
    packageLevel: 'standard',
    priceRange: 'Standard',
    previewImage: '/assets/placeholders/nikah-elegant.jpg',
    demoPath: '/templates/nikah-elegant-01/',
    tags: ['nikah', 'elegant', 'green', 'calm', 'muslim'],
    features: ['Уважительный текст', 'Дата/время', 'Адрес', 'Карта', 'RSVP'],
    recommendedUse: 'Никах, семейные мероприятия, клиенты, которым нужен спокойный и уважительный дизайн.',
    isReady: true,
  },
  {
    slug: 'birthday-party-01',
    name: 'Birthday Party 01',
    title: 'Bright birthday party invitation',
    category: 'birthday',
    label: 'День рождения',
    description: 'Праздничный шаблон для дня рождения с ярким настроением, программой, адресом и подтверждением участия.',
    style: 'party',
    packageLevel: 'starter',
    priceRange: 'Starter',
    previewImage: '/assets/placeholders/birthday-party.jpg',
    demoPath: '/templates/birthday-party-01/',
    tags: ['birthday', 'party', 'bright', 'kids', 'fun'],
    features: ['Hero', 'Программа', 'Адрес', 'RSVP'],
    recommendedUse: 'Дни рождения, детские праздники, вечеринки и быстрые недорогие заказы.',
    isReady: true,
  },
  {
    slug: 'baby-shower-01',
    name: 'Baby Shower 01',
    title: 'Soft baby shower invitation',
    category: 'baby-shower',
    label: 'Baby Shower',
    description: 'Нежный шаблон для baby shower: дата, место, пожелания, дресс-код и RSVP.',
    style: 'soft',
    packageLevel: 'starter',
    priceRange: 'Starter',
    previewImage: '/assets/placeholders/baby-shower.jpg',
    demoPath: '/templates/baby-shower-01/',
    tags: ['baby-shower', 'soft', 'pastel', 'family'],
    features: ['Hero', 'Дата', 'Пожелания', 'Дресс-код', 'RSVP'],
    recommendedUse: 'Baby shower, gender reveal и нежные семейные мероприятия.',
    isReady: true,
  },
] satisfies InvitationTemplate[];

export const readyTemplates = templates.filter((template) => template.isReady);

export const getTemplateBySlug = (slug: string) => templates.find((template) => template.slug === slug);
