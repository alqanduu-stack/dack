import "./globals.css";
import type { Metadata } from "next";
import { env } from "@/lib/env";

export const metadata: Metadata = {
  title: env.NEXT_PUBLIC_APP_NAME,
  description: "Internal reporting platform for MWBE, SDVOB, and EEO workflows."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
