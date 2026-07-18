import type { Metadata } from "next";
import { GlobalHeader } from "../components/layout/global-header";
import "./globals.css";

export const metadata: Metadata = {
  title: "Scientific Commerce",
  description: "Scientific and laboratory products commerce platform",
};

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <body>
        <GlobalHeader />
        {children}
      </body>
    </html>
  );
}
