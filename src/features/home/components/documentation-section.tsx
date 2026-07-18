import { documentationLinks } from "../data";
import { StaggerGroup } from "../animation/stagger-group";
import { Reveal } from "../animation/reveal";
import { Icon } from "./icon";

export function DocumentationSection() {
  return (
    <section id="documentation" className="scroll-mt-28 border-y border-slate-200 bg-white py-20 sm:py-24 lg:py-32">
      <div className="mx-auto grid max-w-[1380px] items-center gap-14 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
        <Reveal>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-blue-600">Documentation & compliance</p>
            <h2 className="mt-4 text-balance text-4xl font-semibold tracking-[-0.05em] text-slate-950 sm:text-5xl">Technical information, ready when you need it.</h2>
            <p className="mt-5 max-w-2xl text-base leading-8 text-slate-600 sm:text-lg">Access specifications and compliance documents directly from relevant product records.</p>
            <StaggerGroup className="mt-8 grid gap-3 sm:grid-cols-2" stagger={75}>
              {documentationLinks.map((item) => <a key={item} href="#documentation" className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm font-semibold text-slate-900 transition duration-300 hover:-translate-y-0.5 hover:border-blue-300 hover:bg-blue-50"><span className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-blue-200/0 blur-xl transition group-hover:bg-blue-200/35" /><span className="relative flex items-center justify-between"><span className="flex items-center gap-3"><span className="grid h-9 w-9 place-items-center rounded-xl bg-white text-blue-700 shadow-sm"><Icon name="document" className="h-4 w-4" /></span>{item}</span><Icon name="chevron" className="h-4 w-4 transition group-hover:translate-x-1" /></span></a>)}
            </StaggerGroup>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
