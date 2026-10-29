import type { Metadata } from "next";
import { Painel } from "./Painel";
import "./globals.css";

export const metadata: Metadata = {
  title: "CardVoz Admin",
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>
        <Painel>{children}</Painel>
      </body>
    </html>
  );
}
