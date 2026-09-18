import type { Metadata } from "next";
import { IBM_Plex_Mono, Rajdhani, Syncopate } from "next/font/google";
import "./globals.css";

const display = Syncopate({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-display",
});

const ui = Rajdhani({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-ui",
});

const mono = IBM_Plex_Mono({
  weight: ["400", "500"],
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "JARVIS — Scherzo Command",
  description: "Cinematic Three.js HUD with WebHID Stream Deck control.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${display.variable} ${ui.variable} ${mono.variable} h-full`}
    >
      <body className="h-full">{children}</body>
    </html>
  );
}
