import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "ЗаказАвто25 | Автомобили из Азии под заказ",
    template: "%s | ЗаказАвто25",
  },
  description:
    "Привоз автомобилей под заказ из Японии, Кореи и Китая. Вы выбираете автомобиль, мы берём на себя всё остальное.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ru" className="h-full antialiased">
      <body className="min-h-full">{children}</body>
    </html>
  );
}
