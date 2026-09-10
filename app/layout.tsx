import type { Metadata, Viewport } from "next";
import { Analytics } from "@vercel/analytics/next";
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
    url: "https://splitit.com.br",
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
  themeColor: "#10B981",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

const ADSENSE_CLIENT = process.env.NEXT_PUBLIC_ADSENSE_CLIENT;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        {ADSENSE_CLIENT && (
          <script
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`}
            crossOrigin="anonymous"
          />
        )}
      </head>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
