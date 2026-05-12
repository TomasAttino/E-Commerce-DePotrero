import type { Metadata } from "next";
import { Russo_One } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";

const russoOne = Russo_One({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-russo-one",
});

export const metadata: Metadata = {
  title: "Camisetas - Muy pronto",
  description: "Tienda online de camisetas de alta calidad",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${russoOne.variable} h-full antialiased font-sans`}
    >
      <body className="min-h-full flex flex-col bg-black text-white font-sans">
        <CartProvider>
          {children}
        </CartProvider>
      </body>
    </html>
  );
}
