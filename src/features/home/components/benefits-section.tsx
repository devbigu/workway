import { benefits } from "../data";
import { StaggerGroup } from "../animation/stagger-group";
import { Reveal } from "../animation/reveal";
import { Icon } from "./icon";
import { SectionHeading } from "./section-heading";
import type { IconName } from "../types";

function BenefitCard({ icon, title, description }: { icon: IconName; title: string; description: string }) {
  return <div className="group rounded-[26px] border border-slate-200 bg-white p-6 shadow-[0_14px_45px_rgba(15,23,42,0.05)] transition duration-300 hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-[0_22px_58px_rgba(15,23,42,0.1)]"><div className="grid h-12 w-12 place-items-center rounded-2xl bg-blue-50 text-blue-700 transition duration-300 group-hover:scale-[1.04]"><Icon name={icon} className="h-6 w-6" /></div><h3 className="mt-6 text-lg font-semibold tracking-[-0.025em] text-slate-950">{title}</h3><p className="mt-3 text-sm leading-6 text-slate-600">{description}</p></div>;
}

export function BenefitsSection() {
  return (
    <section className="py-20 sm:py-24 lg:py-32">
      <div className="mx-auto max-w-[1380px] px-4 sm:px-6 lg:px-8">
        <Reveal><SectionHeading eyebrow="Why Workway" title="Reliable supply for serious scientific work" description="A commerce platform designed around product clarity, compliant purchasing, and dependable fulfilment." /></Reveal>
        <StaggerGroup className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4" stagger={80}>{benefits.map((benefit) => <BenefitCard key={benefit.title} {...benefit} />)}</StaggerGroup>
      </div>
    </section>
  );
}
