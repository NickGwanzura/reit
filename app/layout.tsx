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
  title: "Mutirikwi REIT | Masvingo Flats Project",
  description:
    "Discover Mutirikwi REIT's proposed Masvingo Flats Project: 180 affordable homes in Zimbabwe. Explore the project, review investment terms and risks, and request the investor brochure.",
  metadataBase: new URL("https://mutirikwireitzim.com"),
  alternates: {
    canonical: "/",
  },
  keywords: [
    "Mutirikwi REIT",
    "Masvingo Flats Project",
    "affordable housing Zimbabwe",
    "Zimbabwe real estate investment trust",
    "Masvingo housing development",
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
    title: "Mutirikwi REIT | Affordable Homes in Masvingo",
    description: "A proposed 180-home community in Masvingo, Zimbabwe. Explore the Mutirikwi REIT project, published terms and key risks.",
    url: "/",
    siteName: "Mutirikwi REIT",
    type: "website",
    locale: "en_ZW",
  },
  twitter: {
    card: "summary_large_image",
    title: "Mutirikwi REIT | Affordable Homes in Masvingo",
    description: "Explore a proposed 180-home community in Masvingo, Zimbabwe, and review the project, terms and risks.",
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
