import type { Metadata } from "next";
import Script from "next/script";

import "./globals.css";

export const metadata: Metadata = {
  title: "SynkUp",
  description: "SynkUp tenant dashboard.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <Script id="theme-preference" strategy="beforeInteractive">{`
          try {
            if (localStorage.getItem("synkup-theme-preference") === "dark") {
              document.documentElement.classList.add("dark");
            }
          } catch {}
        `}</Script>
      </head>
      <body>{children}</body>
    </html>
  );
}
