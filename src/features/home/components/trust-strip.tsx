import { trustItems } from "../data";
import { StaggerGroup } from "../animation/stagger-group";
import { Icon } from "./icon";

export function TrustStrip() {
  return (
    <section className="border-y border-slate-200 bg-white/80">
      <StaggerGroup className="mx-auto grid max-w-[1380px] grid-cols-2 gap-px bg-slate-200 px-4 sm:grid-cols-3 sm:px-6 lg:grid-cols-5 lg:px-8" stagger={70}>
        {trustItems.map((item, index) => (
          <div key={item.label} className={`flex min-h-24 items-center justify-center gap-2 bg-white px-4 py-5 text-center text-sm font-semibold text-slate-700 ${index === 4 ? "col-span-2 sm:col-span-1" : ""}`}>
            <Icon name={item.icon} className="h-4 w-4 text-blue-600" />
            {item.label}
          </div>
        ))}
      </StaggerGroup>
    </section>
  );
}
