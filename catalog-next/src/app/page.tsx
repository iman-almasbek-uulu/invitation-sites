"use client";

import { useMemo, useState } from "react";
import { readyTemplates } from "@/data/templates";
import styles from "./page.module.css";

const invitationsBase =
  process.env.NEXT_PUBLIC_INVITATIONS_URL ??
  "http://127.0.0.1:4322/invitation-sites";

export default function Home() {
  const [activeFilter, setActiveFilter] = useState("Все");
  const filters = useMemo(
    () => ["Все", ...Array.from(new Set(readyTemplates.map((template) => template.label)))],
    [],
  );
  const visibleTemplates =
    activeFilter === "Все"
      ? readyTemplates
      : readyTemplates.filter((template) => template.label === activeFilter);

  return (
    <main className={styles.page}>
      <header className={styles.intro}>
        <div className={styles.mark} aria-hidden="true"><i /><i /><i /><i /></div>
        <h1>Выберите приглашение</h1>
        <p>Готовые дизайны для вашего события</p>
      </header>

      <nav className={styles.filters} aria-label="Категории приглашений">
        {filters.map((filter) => (
          <button
            aria-pressed={activeFilter === filter}
            className={activeFilter === filter ? styles.filterActive : styles.filter}
            key={filter}
            onClick={() => setActiveFilter(filter)}
            type="button"
          >
            {filter}
          </button>
        ))}
      </nav>

      <section className={styles.grid} aria-label="Готовые шаблоны">
        {visibleTemplates.map((template) => {
          const demoUrl = `${invitationsBase}${template.demoPath}`;
          const briefUrl = `${invitationsBase}/brief/?template=${template.slug}`;
          return (
            <article className={styles.card} key={template.slug}>
              <a aria-label={`Открыть демо: ${template.name}`} className={`${styles.preview} ${styles[template.art]}`} href={demoUrl}>
                <span className={styles.previewFrame} aria-hidden="true" />
                <span className={styles.previewCaption} aria-hidden="true">Invitation</span>
                <span className={styles.previewTitle} aria-hidden="true">{template.label}</span>
              </a>
              <div className={styles.cardBody}>
                <a className={styles.name} href={demoUrl}>{template.name}</a>
                <p className={styles.category}>{template.label}</p>
                <a className={styles.select} href={briefUrl}>Выбрать</a>
              </div>
            </article>
          );
        })}
      </section>
    </main>
  );
}
