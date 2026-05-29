import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { IoMdAirplane } from "react-icons/io";
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
  title: "Flight Viewer",
  description: "Flight Viewer",
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
        <header className="app-header">
          <div className="brand">
            <IoMdAirplane size={26} />
            <span>
              Flight <span className="brand-accent">Viewer</span>
            </span>
          </div>
          <div className="header-meta">
            <span className="live-dot" />
            <span>Live</span>
          </div>
        </header>
        <main style={{ minHeight: "calc(100vh - 64px)" }}>{children}</main>
      </body>
    </html>
  );
}
