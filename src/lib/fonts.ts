import { Outfit, Inter, JetBrains_Mono } from "next/font/google";

export const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["700", "800"],
  display: "swap",
});

export const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

export const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["500", "600"],
  display: "swap",
});

/** Combined className string – apply to <body> in root layout */
export const fontVariables = [
  outfit.variable,
  inter.variable,
  jetbrainsMono.variable,
].join(" ");
