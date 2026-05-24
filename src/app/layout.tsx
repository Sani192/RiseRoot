import type { Metadata, Viewport } from "next";

import { warnIfRequiredPublicEnvVarsAreMissing } from "@/lib/env";
import "./globals.css";

export const metadata: Metadata = {
  title: "RiseRoot",
  description: "A calm, mobile-first health routine tracker skeleton.",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "RiseRoot",
    statusBarStyle: "default",
  },
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
};

export const viewport: Viewport = {
  themeColor: "#f7f4eb",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  warnIfRequiredPublicEnvVarsAreMissing();

  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
