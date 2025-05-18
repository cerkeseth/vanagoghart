import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import "@rainbow-me/rainbowkit/styles.css";
import { Providers } from "./providers";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Vanagogh",
  description: "Vanagogh collections.",
  icons: {
    icon: "/vana.png",
    shortcut: "/vana.png",
    apple: "/vana.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-[url('/background.webp')] bg-cover bg-center bg-fixed min-h-screen bg-overlay relative`}>
        <div className="relative z-10">
          <Providers>{children}</Providers>
          <Toaster />
        </div>
      </body>
    </html>
  );
}
