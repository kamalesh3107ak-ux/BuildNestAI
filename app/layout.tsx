import { Analytics } from "@vercel/analytics/next";
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://buildnest-ai.vercel.app"),

  title: {
    default: "BuildNest | Construction Marketplace & Services Platform",
    template: "%s | BuildNest",
  },

  description:
    "BuildNest is a smart construction marketplace connecting customers, vendors, brokers, and engineers. Discover materials, rental properties, and professional services—all in one place.",

  keywords: [
    "construction marketplace",
    "building materials",
    "real estate rentals",
    "construction services",
    "vendors",
    "engineers",
    "brokers",
    "BuildNest",
    "India construction platform",
  ],

  authors: [{ name: "BuildNest Team", url: "https://buildnest-ai.vercel.app" }],
  creator: "BuildNest",
  publisher: "BuildNest",

  applicationName: "BuildNest",

  openGraph: {
    title: "BuildNest | Smart Construction Platform",
    description:
      "Find materials, hire engineers, and explore rental properties with BuildNest. Your all-in-one construction ecosystem.",
    url: "https://buildnest-ai.vercel.app",
    siteName: "BuildNest",
    locale: "en_IN",
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "BuildNest | Construction Made Easy",
    description:
      "Discover construction materials, services, and rentals in one place.",
  },

  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },

  category: "technology",

  alternates: {
    canonical: "https://buildnest-ai.vercel.app",
  },

  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
