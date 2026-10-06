import type { Metadata, Viewport } from "next";
import { IBM_Plex_Mono, Instrument_Sans, Instrument_Serif } from "next/font/google";
import { GlobalHeader } from "../components/layout/global-header";
import { CartScopeProvider } from "@/features/cart/components/cart-scope-provider";
import "./globals.css";

const sans = Instrument_Sans({ subsets: ["latin"], variable: "--font-lab-display", display: "swap" });
const serif = Instrument_Serif({ subsets: ["latin"], weight: "400", style: ["normal", "italic"], variable: "--font-lab-serif", display: "swap" });
const mono = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-lab-mono", display: "swap" });

export const viewport: Viewport = {
  colorScheme: "light",
  themeColor: "#f5f3ee",
};

export const metadata: Metadata = {
  title: "Rootra · Laboratory glassware and scientific supplies",
  description: "Glassware, filtration, plasticware, instruments and reagents for labs that order in volume.",
};

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" className={`${sans.variable} ${serif.variable} ${mono.variable}`}>
      <body className="bg-paper font-sans text-ink antialiased">
        <CartScopeProvider>
          <GlobalHeader />
          {children}
        </CartScopeProvider>
      </body>
    </html>
  );
}
