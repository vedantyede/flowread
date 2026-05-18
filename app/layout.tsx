import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FlowRead — Speed Reading Tool",
  description:
    "Read faster, retain more. Paste any text and FlowRead flashes words at your chosen speed using the proven RSVP technique.",
  keywords: ["speed reading", "speed reader", "RSVP reading", "read faster", "focus reading", "productivity"],
  authors: [{ name: "FlowRead" }],
  creator: "FlowRead",
  openGraph: {
    title: "FlowRead — Speed Reading Tool",
    description: "Read faster, retain more. Free, minimal, distraction-free.",
    type: "website",
    locale: "en_US",
    siteName: "FlowRead",
  },
  twitter: {
    card: "summary_large_image",
    title: "FlowRead — Speed Reading Tool",
    description: "Read faster, retain more. Free, minimal, distraction-free.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;0,900;1,400;1,700&family=Source+Serif+4:ital,wght@0,300;0,400;0,600;1,400&family=JetBrains+Mono:wght@300;400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
