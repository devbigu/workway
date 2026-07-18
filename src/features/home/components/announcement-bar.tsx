export function AnnouncementBar() {
  return (
    <div className="bg-slate-950 text-white">
      <div className="mx-auto flex max-w-[1380px] items-center justify-between gap-4 px-4 py-2.5 text-xs sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-4">
          <span className="font-semibold">Explore Laboratory Products</span>
          <div className="hidden items-center gap-4 text-slate-300 md:flex">
            {["Equipment", "Consumables", "Glassware", "Filtration"].map((item) => (
              <a key={item} href="#categories" className="transition hover:text-white focus:outline-none focus:ring-2 focus:ring-white/60">{item}</a>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-4 text-slate-300">
          <span>India</span>
          <a href="#footer" className="hidden transition hover:text-white focus:outline-none focus:ring-2 focus:ring-white/60 sm:inline">Support</a>
        </div>
      </div>
    </div>
  );
}
