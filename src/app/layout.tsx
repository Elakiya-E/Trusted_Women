import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "WithYours - Trusted Women Attendant Services You Can Rely On",
  description: "Book verified, trained, and background-checked women attendants, nursing care, elderly assistants, and security guards. Available 24/7 in Bengaluru, Chennai, Hyderabad, and Coimbatore.",
  keywords: ["women attendants", "elderly care", "nursing care", "women drivers", "assisted travel companion", "women security", "trusted female attendants", "assisted escort services", "trusted women companion services"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-white text-gray-900 min-h-screen`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

