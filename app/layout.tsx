import type { Metadata } from "next";
import type { ReactNode } from "react";
import localFont from "next/font/local";

const overusedGrotesk = localFont({
  src: "./fonts/OverusedGrotesk-VF.woff2",
  variable: "--font-overused-grotesk",
  display: "swap",
  weight: "300 900",
});

export const metadata: Metadata = {
  title: "Mutirikwi REIT | Masvingo Flats Project",
  description:
    "Explore Mutirikwi REIT's Masvingo Flats Project: 180 proposed affordable homes supported by a USD rent-to-own model. View investment terms and request the investment pack.",
  applicationName: "Mutirikwi REIT",
  openGraph: {
    title: "Mutirikwi REIT | Masvingo Flats Project",
    description:
      "A Zimbabwean real estate investment opportunity focused on affordable homes in Masvingo.",
    type: "website",
    locale: "en_ZW",
  },
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en" className={overusedGrotesk.variable}>
      <head>
        <meta name="theme-color" content="#344955" />
        <link rel="icon" href="/assets/mark.svg" type="image/svg+xml" />
        <link rel="stylesheet" href="/styles.css" />
        <link rel="stylesheet" href="/next-overrides.css" />
        <link rel="stylesheet" href="/visual-refinement.css" />
        <link rel="stylesheet" href="/crm.css" />
      </head>
      <body>{children}</body>
    </html>
  );
}
