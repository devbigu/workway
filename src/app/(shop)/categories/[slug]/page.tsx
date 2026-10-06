import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { PageHeader } from "@/components/shared/page-header";
import { departments, findDepartment } from "@/features/categories/data";
import { DepartmentGrid } from "@/features/categories/department-grid";

// Legacy slugs that predate the department list.
const legacyCategoryLabels: Record<string, string> = {
  "laboratory-equipment": "Lab Instruments",
  "filtration-products": "Filters & Membrane",
  glassware: "Laboratory Glassware",
  plasticware: "Plasticware",
};

export function generateStaticParams() {
  return departments.map((department) => ({ slug: department.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const department = findDepartment(slug);

  return department
    ? { title: `${department.title} | Rootra`, description: department.description }
    : {};
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const department = findDepartment(slug);

  if (!department) {
    const legacyCategory = legacyCategoryLabels[slug];
    if (legacyCategory) {
      redirect(`/products?category=${encodeURIComponent(legacyCategory)}`);
    }
    notFound();
  }

  if (department.productCategory) {
    redirect(`/products?category=${encodeURIComponent(department.productCategory)}`);
  }

  const otherDepartments = departments.filter((item) => item.slug !== department.slug);

  return (
    <main className="page-wrap pb-16">
      <PageHeader
        crumbs={[{ label: "Home", href: "/" }, { label: "Departments", href: "/categories" }, { label: department.title }]}
        title={department.title}
        intro={department.description}
        meta={<span className="badge">{department.status}</span>}
        actions={<>
          <Link href="/contact" className="btn btn-secondary">Ask about availability</Link>
          <Link href="/products" className="btn btn-primary">Browse the catalogue</Link>
        </>}
      />
      <p className="mt-8 max-w-[68ch] text-ink-2 lg:mt-12">
        We are still curating this range. In the meantime, the full scientific catalogue is open for orders.
      </p>

      <section className="mt-16 border-t border-line pt-16 lg:mt-24" aria-labelledby="other-departments">
        <h2 id="other-departments" className="section-title mb-10">Other departments</h2>
        <DepartmentGrid departments={otherDepartments} />
      </section>
    </main>
  );
}
