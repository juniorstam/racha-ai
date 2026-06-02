import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Racha Aí – Divisor de Contas",
  description: "Divida a conta sem dividir a amizade. Separe despesas de bar, restaurante, churrasco e festas.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Racha Aí",
  },
  openGraph: {
    title: "Racha Aí – Divisor de Contas",
    description: "Divida a conta sem dividir a amizade.",
    url: "https://rachaai.stamcom.com.br",
    siteName: "Racha Aí",
    locale: "pt_BR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Racha Aí – Divisor de Contas",
    description: "Divida a conta sem dividir a amizade.",
  },
};

export const viewport: Viewport = {
  themeColor: "#6C47FF",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
