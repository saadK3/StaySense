import type { Metadata } from "next";
import { Inter, Lora } from "next/font/google";
import "./globals.css";
import { Navigation } from "@/components/Navigation";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const lora = Lora({
  variable: "--font-serif",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "StaySense AI Dashboard",
  description: "Advanced analytics and AI insights for hotel management.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${lora.variable} antialiased h-full`}>
      <body className="h-full bg-background text-foreground flex">
        <Navigation>
          {children}
        </Navigation>
      </body>
    </html>
  );
}

