import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "@cdt5058/json-render-uswds Demo",
  description: "Generate USWDS pages from plain English prompts with Claude",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
