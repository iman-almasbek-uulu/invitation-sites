import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Invitation Sites — каталог приглашений",
  description: "Выберите готовый дизайн цифрового приглашения.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  );
}
