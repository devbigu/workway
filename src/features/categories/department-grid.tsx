import Image from "next/image";
import Link from "next/link";

import { Icon } from "@/features/home/components/icon";
import type { Department } from "./data";

export function DepartmentGrid({ departments }: { departments: Department[] }) {
  return (
    <ul className="grid grid-cols-2 gap-x-3 gap-y-8 md:gap-x-6 lg:grid-cols-4">
      {departments.map((department) => (
        <li key={department.slug} className="pcard">
          <div className="pcard-media">
            {department.image ? (
              <Image src={department.image} alt="" fill sizes="(min-width: 1024px) 25vw, 50vw" />
            ) : (
              <Icon name={department.icon} />
            )}
          </div>
          <p className="pcard-sku">{department.status}</p>
          <h3 className="pcard-title">
            <Link href={`/categories/${department.slug}`}>{department.title}</Link>
          </h3>
          <p className="text-sm text-ink-3">{department.description}</p>
        </li>
      ))}
    </ul>
  );
}
