import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "WOLVERINE 22 Progress Tracker",
  description: "Track your order progress",
  icons: {
      icon: "/generated-image.png",
    },

    openGraph: {
      images: [
        {
          url: "/generated-image.png",
          width: 1200,
          height: 630,
        },
      ],
    },

    twitter: {
      images: ["/generated-image.png"],
    },


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
        {children}
      </body>
    </html>
  );
}
