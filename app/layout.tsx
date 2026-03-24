import type { Metadata } from "next";
import { Geist_Mono } from "next/font/google";
import Navbar from "./components/Navbar";
import UserProvider from "./components/UserProvider";
import "./globals.css";

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Arcade | Browser Games",
  description: "Play classic arcade games in your browser",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <UserProvider>
          <Navbar />
          <main className="flex-1">{children}</main>
        </UserProvider>
      </body>
    </html>
  );
}
