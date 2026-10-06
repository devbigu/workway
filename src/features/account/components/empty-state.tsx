import Link from "next/link";

export function AccountEmptyState({
  title,
  description,
  action = true,
}: {
  title: string;
  description: string;
  action?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
      <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-blue-50 text-2xl" aria-hidden="true">□</div>
      <h2 className="mt-5 text-lg font-bold text-slate-950">{title}</h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">{description}</p>
      {action && <Link href="/products" className="mt-6 inline-flex min-h-11 items-center rounded-xl bg-blue-600 px-5 text-sm font-bold text-white hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2">Continue Shopping</Link>}
    </div>
  );
}
