import Link from "next/link";
import { Icon } from "@/features/home/components/icon";

export function AccountMenu() {
  return (
    <Link href="/account" aria-label="Account" className="hidden h-10 w-10 place-items-center rounded-full text-slate-700 transition hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 sm:grid">
      <Icon name="user" className="h-5 w-5" />
    </Link>
  );
}
