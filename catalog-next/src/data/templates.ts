import { astroCatalogTemplates } from "./astro-template-catalog.generated";

export type CatalogTemplate = {
  slug: string;
  name: string;
  label: string;
  demoPath: string;
  art: "royal" | "minimal" | "nikah" | "party" | "soft";
};

type TemplateStyle = "luxury" | "minimal" | "elegant" | "party" | "soft";

const artByStyle: Record<TemplateStyle, CatalogTemplate["art"]> = {
  luxury: "royal",
  minimal: "minimal",
  elegant: "nikah",
  party: "party",
  soft: "soft",
};

/** Публичная витрина строится прямо из единственного Astro-источника шаблонов. */
export const readyTemplates: CatalogTemplate[] = astroCatalogTemplates.map((template) => ({
  slug: template.slug,
  name: template.name,
  label: template.label,
  demoPath: template.demoPath,
  art: artByStyle[template.style],
}));
