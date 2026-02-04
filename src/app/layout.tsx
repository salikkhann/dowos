import type { Metadata } from "next";
import { fontVariables } from "@/lib/fonts";
import { RootLayoutClient } from "./layout-client";
import "./globals.css";

export const metadata: Metadata = {
  title: "DowOS",
  description: "The all-in-one super-app for Dow Medical College students.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${fontVariables} antialiased`}>
        <RootLayoutClient>{children}</RootLayoutClient>
      </body>
    </html>
  );
}
