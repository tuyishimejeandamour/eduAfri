import type React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Providers } from "@/app/[lang]/components/providers";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "EduAfri - Offline Educational Content",
  description:
    "Access high-quality educational materials offline across Africa",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <div className="flex w-full  h-full justify-center items-center flex-col">
          <Providers>{children}</Providers>
        </div>
      </body>
    </html>
  );
}
