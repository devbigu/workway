import { Loader } from "@/components/ui/loader";

export default function Loading() {
  return (
    <main className="flex min-h-screen items-center justify-center" aria-busy="true">
      <Loader />
    </main>
  );
}
