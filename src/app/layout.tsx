import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
});

export const metadata: Metadata = {
  title: "CloudDining OS | Multi-Tenant Super Admin Console",
  description:
    "Central Enterprise Management Platform for Multi-Outlet Restaurant Chains, Credential Provisioning, and Tenant Orchestration.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <body className="bg-slate-950 text-slate-100 antialiased selection:bg-amber-400 selection:text-slate-950">
        {children}
      </body>
    </html>
  );
}
