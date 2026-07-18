import { statistics } from "../data";
import { StaggerGroup } from "../animation/stagger-group";
import { AnimatedCounter } from "../animation/animated-counter";

export function StatisticsSection() {
  return (
    <section className="bg-slate-950 py-12 text-white">
      <StaggerGroup className="mx-auto grid max-w-[1380px] grid-cols-2 gap-8 px-4 sm:px-6 lg:grid-cols-4 lg:px-8" stagger={80}>
        {statistics.map(([value, label], index) => <div key={label} className={`text-center ${index > 0 ? "lg:border-l lg:border-white/15" : ""}`}><p className="text-4xl font-bold tracking-[-0.05em] sm:text-5xl"><AnimatedCounter value={value} /></p><p className="mt-2 text-sm text-slate-400">{label}</p></div>)}
      </StaggerGroup>
    </section>
  );
}
