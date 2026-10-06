import { benefits } from "../data";
import { Icon } from "./icon";
import { SectionHeading } from "./section-heading";

export function BenefitsSection() {
  return (
    <section className="border-t border-line py-16 lg:py-24">
      <div className="page-wrap">
        <SectionHeading eyebrow="Why Rootra" title="Reliable supply for serious scientific work" description="Product clarity, compliant purchasing and dependable fulfilment." />
        <ul className="grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
          {benefits.map(({ icon, title, description }) => (
            <li key={title} className="border-t border-line pt-6">
              <Icon name={icon} className="h-6 w-6 text-ink" strokeWidth={1.25} />
              <h3 className="subsection mt-5">{title}</h3>
              <p className="mt-2 text-sm text-ink-2">{description}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
