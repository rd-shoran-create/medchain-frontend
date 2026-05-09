import type { Metadata } from "next";
import { Inter, Manrope, Libre_Barcode_39 } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";

const inter = Inter({ subsets: ["latin"] });
const manrope = Manrope({ subsets: ["latin"], weight: ["400", "500", "600", "700", "800"], variable: "--font-manrope" });
const libreBarcode = Libre_Barcode_39({ subsets: ["latin"], weight: ["400"], variable: "--font-libre-barcode" });

export const metadata: Metadata = {
  title: "PrescChain | Advanced Web3 Pharmacy Auditing",
  description: "A decentralized, immutable track-and-trace system for controlled substances.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" rel="stylesheet" />
      </head>
      <body className={`${inter.className} ${manrope.variable} ${libreBarcode.variable}`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
