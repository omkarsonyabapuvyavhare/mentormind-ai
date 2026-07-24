import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import { AppStoreProvider } from "@/components/providers/app-store-provider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteDescription =
  "An AI learning agent that creates adaptive roadmaps, remembers learner progress, and continuously guides users toward real-world outcomes.";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;

export const metadata: Metadata = {
  title: "MentorMind AI",
  description: siteDescription,
  applicationName: "MentorMind AI",
  ...(siteUrl ? { metadataBase: new URL(siteUrl) } : {}),
  openGraph: {
    title: "MentorMind AI",
    description: siteDescription,
    type: "website",
    siteName: "MentorMind AI",
  },
  twitter: {
    card: "summary_large_image",
    title: "MentorMind AI",
    description: siteDescription,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <AppStoreProvider>{children}</AppStoreProvider>
      </body>
    </html>
  );
}
