import type { Metadata, Viewport } from "next";
import { headers } from "next/headers";
import { DM_Sans, Geist, Geist_Mono, JetBrains_Mono, Syne } from "next/font/google";

import "../styles/globals.css";
import PageDataStreamClient from "@/components/landing/PageDataStreamClient";
import { AppProviders } from "@/components/providers/AppProviders";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });
const syne = Syne({ variable: "--font-syne", subsets: ["latin"] });
const dmSans = DM_Sans({ variable: "--font-dm-sans", subsets: ["latin"] });
const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "XYZ-For-Now",
    template: "%s - XYZ-For-Now",
  },
  description:
    "Enterprise carbon management for measurement, capture, and compliance. " +
    "Demo experience tailored to Tata client use cases.",
  applicationName: "XYZ-For-Now",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "XYZ-For-Now",
  },
  icons: {
    icon: [
      { url: "/icons/icon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" }],
  },
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: "#050A14",
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  // nonce from proxy.ts for CSP, attached to inline scripts and styles
  const nonce = (await headers()).get("x-nonce") ?? "";

  return (
    <html lang="en" data-nonce={nonce}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${syne.variable} ${dmSans.variable} ${jetbrainsMono.variable} antialiased`}
      >
        <PageDataStreamClient />
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
