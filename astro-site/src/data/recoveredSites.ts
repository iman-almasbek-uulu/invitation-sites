export type RecoveredSite = {
  slug: string;
  title: string;
  language: 'RU' | 'KG';
  style: string;
  archivedPath: string;
  sourceUrl: string;
  previewImage: string;
  assets: number;
};

// Published snapshots recovered from the owner-provided Tilda catalogue on 2026-07-12.
// The source pages and their downloaded public assets live in public/recovered-archive/.
export const recoveredSites: RecoveredSite[] = [
  {
    slug: 'dastan-nuriza',
    title: 'Дастан & Нуриза',
    language: 'RU',
    style: 'тёплая свадебная история',
    archivedPath: '/recovered-archive/dastannuriza/priglasiabakirova.tilda.ws/dastannuriza.html',
    sourceUrl: 'https://priglasiabakirova.tilda.ws/dastannuriza',
    previewImage: 'https://static.tildacdn.one/tild6538-6135-4635-b736-313738323938/IMAGE_2025-10-21_165.jpg',
    assets: 37,
  },
  {
    slug: 'duulat-adema',
    title: 'Дуулат & Адэма',
    language: 'RU',
    style: 'современная свадьба',
    archivedPath: '/recovered-archive/duulatadema/priglasiabakirova.tilda.ws/duulatadema.html',
    sourceUrl: 'https://priglasiabakirova.tilda.ws/duulatadema',
    previewImage: 'https://static.tildacdn.one/tild3666-6337-4439-a531-386632343932/IMAGE_2026-03-11_124.jpg',
    assets: 21,
  },
  {
    slug: 'adilet-janylmyrza',
    title: 'Адилет & Жаңылмырза',
    language: 'RU',
    style: 'фото-приглашение',
    archivedPath: '/recovered-archive/adiletjanylmyrza/priglasiabakirova.tilda.ws/adiletjanylmyrza.html',
    sourceUrl: 'https://priglasiabakirova.tilda.ws/adiletjanylmyrza',
    previewImage: 'https://static.tildacdn.one/tild3831-3564-4131-b962-303264303433/IMAGE_2025-11-01_223.jpg',
    assets: 55,
  },
  {
    slug: 'eridan-suzana',
    title: 'Эридан & Сузана',
    language: 'RU',
    style: 'графичная классика',
    archivedPath: '/recovered-archive/eridansuzanaru/priglasiabakirova.tilda.ws/eridansuzanaru.html',
    sourceUrl: 'https://priglasiabakirova.tilda.ws/eridansuzanaru',
    previewImage: 'https://optim.tildacdn.one/tild3661-6539-4439-b336-636563343134/-/format/webp/_-_2026-04-08T170847.png.webp',
    assets: 37,
  },
  {
    slug: 'maksat-zuraida',
    title: 'Максат & Зурайда',
    language: 'KG',
    style: 'авторская векторная история',
    archivedPath: '/recovered-archive/maksatzuraidakg/priglasiabakirov.tilda.ws/maksatzuraidakg.html',
    sourceUrl: 'https://priglasiabakirova.tilda.ws/maksatzuraidakg',
    previewImage: 'https://static.tildacdn.one/tild3433-3338-4337-b337-646234326330/4029084.png',
    assets: 34,
  },
];
