import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "CandidView — Fair CV Screening",
  description:
    "AI-powered CV screening that emphasises fairness, transparency, and human-in-the-loop decision making.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full`}>
      <body className="min-h-full flex flex-col text-foreground" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
