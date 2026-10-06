export default function Loading() {
  return (
    <main className="page-wrap pb-16" aria-busy="true" aria-label="Loading">
      <div className="border-b border-line pb-6 pt-8 lg:pt-12">
        <div className="skeleton h-3 w-40" />
        <div className="skeleton mt-4 h-12 w-2/3 max-w-xl" />
        <div className="skeleton mt-4 h-4 w-1/2 max-w-md" />
      </div>
      <div className="mt-8 grid grid-cols-2 gap-x-3 gap-y-6 md:grid-cols-3 md:gap-x-6 lg:mt-12 xl:grid-cols-4">
        {Array.from({ length: 8 }, (_, index) => (
          <div key={index} className="grid gap-3">
            <div className="skeleton aspect-square rounded-md" />
            <div className="skeleton h-3 w-1/3" />
            <div className="skeleton h-4 w-4/5" />
          </div>
        ))}
      </div>
    </main>
  );
}
