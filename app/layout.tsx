import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Creator Copilot",
  description:
    "Pre-publish optimization for creators, local brands, and small businesses.",
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
