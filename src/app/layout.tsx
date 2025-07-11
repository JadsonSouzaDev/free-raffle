import type { Metadata, Viewport } from "next";
import { Roboto_Slab } from "next/font/google";
import "./globals.css";
import { Navbar } from "./components/Navbar";
import Footer from "./components/Footer";
import { Toaster } from "sonner";

const robotoSlab = Roboto_Slab({
  subsets: ["latin"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: "Cara de boné",
  description: "Cara de boné",
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon-96x96.png", sizes: "96x96", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png" }
    ],
  }
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
        <Toaster richColors position="top-right" />
        <main className="flex flex-col max-w-screen-sm mx-auto min-h-screen p-2 md:p-4 pt-18 md:pt-24  bg-gray-600 text-white">
          <Navbar />
          <div className="min-h-[calc(100vh-260px)] md:min-h-[calc(100vh-290px)]">
            {children}
          </div>
          <Footer />
        </main>
      </body>
    </html>
  );
}
