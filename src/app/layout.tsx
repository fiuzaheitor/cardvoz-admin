import type { Metadata } from "next";
import { Atkinson_Hyperlegible, Nunito } from "next/font/google";
import { Painel } from "./Painel";
import "./globals.css";

// As mesmas fontes do CardVoz: Atkinson Hyperlegible foi feita para baixa visão
const nunito = Nunito({ subsets: ["latin"], weight: ["700", "800"], variable: "--fonte-titulo", display: "swap" });
const atkinson = Atkinson_Hyperlegible({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--fonte-texto",
  display: "swap",
});

export const metadata: Metadata = {
  title: "CardVoz Admin",
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${nunito.variable} ${atkinson.variable}`}>
      <body>
        <Painel>{children}</Painel>
      </body>
    </html>
  );
}
