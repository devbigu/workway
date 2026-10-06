export default function AccountLoading() {
  return (
    <main className="min-h-screen animate-pulse bg-[#f5f7f2] px-4 py-8">
      <div className="mx-auto max-w-7xl">
        <div className="h-28 rounded-2xl bg-slate-200" />
        <div className="mt-6 grid gap-6 lg:grid-cols-[260px_1fr]">
          <div className="hidden h-96 rounded-2xl bg-slate-200 lg:block" />
          <div className="space-y-5">
            <div className="h-20 rounded-2xl bg-slate-200" />
            <div className="h-72 rounded-2xl bg-white shadow-sm" />
            <div className="h-72 rounded-2xl bg-white shadow-sm" />
          </div>
        </div>
      </div>
    </main>
  );
}
