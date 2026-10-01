import type { Metadata } from "next";
import type { ReactNode } from "react";
import localFont from "next/font/local";

const inter = localFont({
  src: "./fonts/InterVariable.woff2",
  variable: "--font-inter",
  display: "swap",
  weight: "100 900",
});

const overusedGrotesk = localFont({
  src: "./fonts/OverusedGrotesk-VF.woff2",
  variable: "--font-overused-grotesk",
  display: "swap",
  weight: "300 900",
});

const sourceSans3 = localFont({
  src: "./fonts/SourceSans3-Variable.woff2",
  variable: "--font-source-sans-3",
  display: "swap",
  weight: "200 900",
});

const sourceSerif4 = localFont({
  src: "./fonts/SourceSerif4-Variable.woff2",
  variable: "--font-source-serif-4",
  display: "swap",
  weight: "200 900",
});

export const metadata: Metadata = {
  title: "Mutirikwi REIT | Commercial Real Estate in Masvingo",
  description:
    "Explore Mutirikwi REIT's commercial real estate strategy in the Masvingo region. Review October 2026 investment terms, target returns and risks, and request the fact sheet.",
  metadataBase: new URL("https://mutirikwireitzim.com"),
  alternates: {
    canonical: "/",
  },
  keywords: [
    "Mutirikwi REIT",
    "commercial real estate Zimbabwe",
    "Masvingo property investment",
    "SECZ licensed REIT",
    "Zimbabwe real estate investment trust",
  ],
  creator: "Mutirikwi REIT",
  publisher: "Mutirikwi REIT",
  category: "Real Estate",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  applicationName: "Mutirikwi REIT",
  openGraph: {
    title: "Mutirikwi REIT | Commercial Property in Masvingo",
    description: "A SECZ-licensed REIT focused on commercial property opportunities in the Masvingo region. Review target terms and risks.",
    url: "/",
    siteName: "Mutirikwi REIT",
    type: "website",
    locale: "en_ZW",
  },
  twitter: {
    card: "summary_large_image",
    title: "Mutirikwi REIT | Commercial Property in Masvingo",
    description: "Explore commercial real estate opportunities in the Masvingo region and review Mutirikwi REIT terms and risks.",
  },
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en" className={`${overusedGrotesk.variable} ${inter.variable} ${sourceSans3.variable} ${sourceSerif4.variable}`}>
      <head>
        <meta name="theme-color" content="#344955" />
        <link rel="stylesheet" href="/styles.css" />
        <link rel="stylesheet" href="/next-overrides.css" />
        <link rel="stylesheet" href="/visual-refinement.css" />
        <link rel="stylesheet" href="/crm.css" />
      </head>
      <body>{children}</body>
    </html>
  );
}
