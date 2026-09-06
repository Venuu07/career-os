import type { Metadata } from "next";
import { Onest } from "next/font/google";
import { Geist_Mono } from "next/font/google";
import "./globals.css";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";

const onest = Onest({
  variable: "--font-onest",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "CareerOS — ATS Careers Page Builder",
    template: "%s | CareerOS",
  },
  description:
    "CareerOS is a recruiter-first Careers Page Builder. Build, preview, and publish a branded careers page in minutes.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${onest.variable} ${geistMono.variable} antialiased`} style={{ fontFamily: "var(--font-onest), system-ui, sans-serif" }}>
        <AuthProvider>
          <TooltipProvider>{children}</TooltipProvider>
        </AuthProvider>
      </body>
    </html>
  );
}