import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Human 2.0 - Tracker",
  description: "Track your evolution.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className="dark">
      <body className={`${inter.className} text-zinc-300 antialiased min-h-screen flex flex-col md:flex-row selection:bg-indigo-500/30 selection:text-indigo-200 bg-zinc-950`}>
        {children}
      </body>
    </html>
  );
}
