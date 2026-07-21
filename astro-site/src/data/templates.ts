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
    slug: 'sanzhar-kasiet-wedding',
    name: 'Санжар & Касиет',
    title: 'Персональное свадебное приглашение Санжара и Касиет',
    category: 'wedding',
    label: 'Свадьба',
    description: 'Готовое мобильное свадебное приглашение: музыка, таймер, карта и контакты.',
    style: 'luxury',
    packageLevel: 'premium',
    priceRange: 'Premium',
    previewImage: '/assets/placeholders/sanzhar-kasiet-wedding.jpg',
    demoPath: 'https://wedding-invitation-blue-beta.vercel.app/',
    tags: ['wedding', 'personal', 'mobile', 'music', 'countdown'],
    features: ['Мобильный формат', 'Музыка', 'Countdown', 'Карта', 'Контакты'],
    recommendedUse: 'Персональное свадебное приглашение для гостей Санжара и Касиет.',
    isReady: true,
  },
] satisfies InvitationTemplate[];

export const readyTemplates = templates.filter((template) => template.isReady);

export const getTemplateBySlug = (slug: string) => templates.find((template) => template.slug === slug);
