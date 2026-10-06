import Link from "next/link";
import { departments } from "@/features/categories/data";
import { DepartmentGrid } from "@/features/categories/department-grid";
import { SectionHeading } from "./section-heading";

export function CategorySection() {
  return (
    <section id="categories" className="scroll-mt-24 border-t border-line py-16 lg:py-24">
      <div className="page-wrap">
        <SectionHeading
          eyebrow="Departments"
          title="Shop by department"
          description="From precision laboratory glassware to wellness and decor for the spaces you work in."
          action={<Link href="/categories" className="link link-arrow shrink-0 text-sm">All departments</Link>}
        />
        <DepartmentGrid departments={departments} />
      </div>
    </section>
  );
}
