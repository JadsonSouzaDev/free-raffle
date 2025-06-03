import type { Metadata } from "next";
import { Roboto_Slab } from "next/font/google";
import "./globals.css";
import { Navbar } from "./components/Navbar";
import Footer from "./components/Footer";

const robotoSlab = Roboto_Slab({
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
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      </head>
      <body className={`${robotoSlab.className} antialiased`}>
        <main className="flex flex-col max-w-screen-sm mx-auto min-h-screen p-2 md:p-4 pt-18 md:pt-24 md:border-x border-white bg-white/95">
          <Navbar />
          {children}
          <Footer />
        </main>
      </body>
    </html>
  );
}
