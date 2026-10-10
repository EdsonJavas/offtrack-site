import type { Metadata, Viewport } from "next";
import { Inter, Syne } from "next/font/google";
import { SmoothScroll } from "@/components/SmoothScroll/SmoothScroll";
import { CartProvider } from "@/components/Cart/CartProvider";
import { CartDrawer } from "@/components/Cart/CartDrawer";
import { brand } from "@/data/brand";
import "./globals.css";

const syne = Syne({
  variable: "--font-syne",
  subsets: ["latin"],
  weight: ["700", "800"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: `${brand.name} — ${brand.slogan}`,
  description: brand.description,
};

export const viewport: Viewport = {
  themeColor: "#0a0a0a",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" className={`${syne.variable} ${inter.variable}`}>
      <body>
        <CartProvider>
          <SmoothScroll>{children}</SmoothScroll>
          <CartDrawer />
        </CartProvider>
      </body>
    </html>
  );
}
