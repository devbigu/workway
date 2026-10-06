import Link from "next/link";

import { PageHeader } from "@/components/shared/page-header";

export const metadata = { title: "Privacy | Rootra" };

export default function PrivacyPage() {
  return (
    <main className="page-wrap pb-16">
      <PageHeader crumbs={[{ label: "Home", href: "/" }, { label: "Privacy" }]} title="Privacy policy" />
      <div className="prose mt-8 lg:mt-12">
        <p>We are preparing the full privacy policy. Until it is published, <Link href="/contact" className="link">contact us</Link> with any question about how your data is handled.</p>
      </div>
    </main>
  );
}
