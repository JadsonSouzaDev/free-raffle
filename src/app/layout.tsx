import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Navbar } from "./components/Navbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Cara de boné",
  description: "Cara de boné",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <main className="flex flex-col max-w-screen-sm mx-auto min-h-screen p-2 md:p-4 pt-24 md:pt-24 md:border-x border-white bg-white/95 pb-30">
          <Navbar />
          {children}
        </main>
      </body>
    </html>
  );
}
