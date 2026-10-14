import type { Metadata } from "next";
import { Inter, Fredoka } from "next/font/google";
import { ReactNode } from "react";
import "./globals.css";
import DevToolbar from "@/components/DevToolbar";

const inter = Inter({ subsets: ["latin"], variable: "--font-body" });
const fredoka = Fredoka({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-display",
});

const appName = process.env.NEXT_PUBLIC_APP_NAME || "Glitch";

export const metadata: Metadata = {
  title: `${appName} Lab Online`,
  description: "Interactive coding challenges and puzzles",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${fredoka.variable} font-body`}>
        {children}
        <DevToolbar />
      </body>
    </html>
  );
}
