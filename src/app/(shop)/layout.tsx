import { SiteFooter } from "@/components/layout/site-footer";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <>
      {children}
      <SiteFooter />
    </>
  );
}
