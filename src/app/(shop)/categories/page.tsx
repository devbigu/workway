import { PageHeader } from "@/components/shared/page-header";
import { departments } from "@/features/categories/data";
import { DepartmentGrid } from "@/features/categories/department-grid";

export const metadata = {
  title: "Departments | Rootra",
  description: "Browse every department in the Rootra catalogue.",
};

export default function CategoriesPage() {
  return (
    <main className="page-wrap pb-16">
      <PageHeader
        crumbs={[{ label: "Home", href: "/" }, { label: "Departments" }]}
        title="Departments"
        intro="Precision laboratory glassware, with wellness and decor ranges on the way."
        meta={`${departments.length} departments`}
      />
      <div className="mt-8 lg:mt-12">
        <DepartmentGrid departments={departments} />
      </div>
    </main>
  );
}
