import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cloud Store",
  description: "Personal cloud storage web client"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
