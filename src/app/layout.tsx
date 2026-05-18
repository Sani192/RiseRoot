import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "RiseRoot",
  description: "A calm, mobile-first health routine tracker skeleton.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
