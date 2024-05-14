import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "@/styles/globals.css";
import { cn } from "@/lib/utils";
import { Providers } from "./providers";
import GoogleAnalytics from "./GoogleAnalytics";
import Hotjar from "./Hotjar";

const fontSans = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Next.js Starter",
  description: "A Next.js starter for Firebase with Tailwind CSS and TypeScript. Stripe intregration included. Shadcn/ui for UI components.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          fontSans.variable
        )}
      >
        {process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID ? (
          <GoogleAnalytics
            ga_id={process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID}
          />
        ) : null}
        {process.env.NEXT_PUBLIC_HOTJAR_ID ? (
          <Hotjar hjid={process.env.NEXT_PUBLIC_HOTJAR_ID} />
        ) : null}
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
