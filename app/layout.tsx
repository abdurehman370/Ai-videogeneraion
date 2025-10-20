import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "../components/Header";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AdGen Studio",
  description: "Generate AI video ads from your script instantly.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-[rgb(var(--bg))] text-[rgb(var(--fg))]`}> 
        <div className="min-h-screen flex flex-col">
          <Header />
          <main className="flex-1 container-max py-8">{children}</main>
          <footer className="py-6 text-sm text-center text-neutral-500 dark:text-neutral-400">© {new Date().getFullYear()} AdGen Studio</footer>
        </div>
      </body>
    </html>
  );
}
