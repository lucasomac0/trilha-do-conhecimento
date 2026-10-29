import type { Metadata } from "next";
import { Press_Start_2P, Quicksand } from "next/font/google";
import "./globals.css";

const press = Press_Start_2P({ weight: "400", subsets: ["latin"], variable: "--font-press" });
const quicksand = Quicksand({ subsets: ["latin"], variable: "--font-quicksand" });

export const metadata: Metadata = {
  title: "Trilha do Conhecimento",
  description: "Jornada nas estrelas: ajude o astronauta usando seus conhecimentos em tecnologia",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${press.variable} ${quicksand.variable}`}>
      <body className="font-sans">{children}</body>
    </html>
  );
}
