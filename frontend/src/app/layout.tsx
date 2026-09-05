import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { TooltipProvider } from "@/components/ui/tooltip"; // <-- Add this import

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "CareerOS",
  description: "AI-assisted careers page builder",
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
        <TooltipProvider> {/* <-- Wrap children with this */}
          {children}
        </TooltipProvider>
      </body>
    </html>
  );
}