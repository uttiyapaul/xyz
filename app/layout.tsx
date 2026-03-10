// app/layout.tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { headers } from "next/headers";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "XYZ For Now — GHG Accounting Platform",
  description: "ISO 14064-compliant greenhouse gas emissions accounting, ESG reporting, and third-party verification.",
  robots: { index: false, follow: false }, // Private SaaS — no indexing
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  // nonce from middleware for CSP — attach to any inline scripts/styles
  const nonce = (await headers()).get("x-nonce") ?? "";

  return (
    <html lang="en" data-nonce={nonce}>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {/* Providers handles Redux + Auth sync — AuthProvider removed (was duplicate) */}
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
