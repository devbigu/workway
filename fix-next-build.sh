#!/usr/bin/env bash

set -euo pipefail

echo "Fixing Next.js build errors..."

# --------------------------------------------------
# 1. FIX THE @/* ALIAS FOR src/
# --------------------------------------------------

cp tsconfig.json tsconfig.json.backup

python3 <<'PY'
from pathlib import Path
import re

path = Path("tsconfig.json")
text = path.read_text(encoding="utf-8")

alias_pattern = r'"@/\*"\s*:\s*\[[^\]]*\]'

if re.search(alias_pattern, text):
    text = re.sub(
        alias_pattern,
        '"@/*": ["./src/*"]',
        text,
        count=1,
    )
elif re.search(r'"paths"\s*:\s*\{', text):
    text = re.sub(
        r'("paths"\s*:\s*\{)',
        r'\1\n      "@/*": ["./src/*"],',
        text,
        count=1,
    )
else:
    additions = '"paths": {\n      "@/*": ["./src/*"]\n    },'

    if not re.search(r'"baseUrl"\s*:', text):
        additions = '"baseUrl": ".",\n    ' + additions

    text = re.sub(
        r'("compilerOptions"\s*:\s*\{)',
        r'\1\n    ' + additions,
        text,
        count=1,
    )

path.write_text(text, encoding="utf-8")
PY

# --------------------------------------------------
# 2. FIX src/proxy.ts
# --------------------------------------------------

cat > src/proxy.ts <<'TS'
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export function proxy(_request: NextRequest) {
  return NextResponse.next();
}
TS

# --------------------------------------------------
# 3. FIX ROOT ERROR BOUNDARY
# --------------------------------------------------

cat > src/app/error.tsx <<'TSX'
"use client";

import { useEffect } from "react";

interface ErrorPageProps {
  error: Error & {
    digest?: string;
  };
  reset: () => void;
}

export default function ErrorPage({
  error,
  reset,
}: ErrorPageProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex min-h-[60vh] items-center justify-center px-6">
      <div className="max-w-md text-center">
        <h1 className="text-2xl font-semibold">
          Something went wrong
        </h1>

        <p className="mt-3 text-sm text-gray-600">
          An unexpected error occurred while loading this page.
        </p>

        <button
          type="button"
          onClick={reset}
          className="mt-6 rounded-md bg-black px-4 py-2 text-sm text-white"
        >
          Try again
        </button>
      </div>
    </main>
  );
}
TSX

# --------------------------------------------------
# 4. CREATE VALID GLOBAL HEADER
# --------------------------------------------------

mkdir -p src/components/layout

cat > src/components/layout/global-header.tsx <<'TSX'
import Link from "next/link";

export function GlobalHeader() {
  return (
    <header className="sticky top-0 z-50 border-b bg-white">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-6 px-4">
        <Link href="/" className="font-semibold text-gray-950">
          Scientific Commerce
        </Link>

        <nav className="hidden items-center gap-5 md:flex">
          <Link href="/products">Products</Link>
          <Link href="/search">Search</Link>
          <Link href="/about">About</Link>
          <Link href="/contact">Contact</Link>
        </nav>

        <div className="ml-auto flex items-center gap-4">
          <Link href="/cart">Cart</Link>
          <Link href="/login">Login</Link>
        </div>
      </div>
    </header>
  );
}
TSX

# --------------------------------------------------
# 5. FIX SPECIAL ROOT FILES IF EMPTY
# --------------------------------------------------

if [[ ! -s src/app/loading.tsx ]]; then
  cat > src/app/loading.tsx <<'TSX'
export default function Loading() {
  return (
    <main className="flex min-h-[50vh] items-center justify-center">
      <p>Loading...</p>
    </main>
  );
}
TSX
fi

if [[ ! -s src/app/not-found.tsx ]]; then
  cat > src/app/not-found.tsx <<'TSX'
import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-[60vh] items-center justify-center px-6">
      <div className="text-center">
        <h1 className="text-3xl font-semibold">Page not found</h1>

        <Link
          href="/"
          className="mt-5 inline-block underline"
        >
          Return home
        </Link>
      </div>
    </main>
  );
}
TSX
fi

# --------------------------------------------------
# 6. INITIALIZE EMPTY PAGE FILES
# --------------------------------------------------

find src/app -type f -name "page.tsx" -empty -print0 |
while IFS= read -r -d '' file; do
  route="${file#src/app/}"
  route="${route%/page.tsx}"

  cat > "$file" <<TSX
export default function Page() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="text-2xl font-semibold">
        ${route}
      </h1>

      <p className="mt-3 text-gray-600">
        This page is under development.
      </p>
    </main>
  );
}
TSX

  echo "Initialized page: $file"
done

# --------------------------------------------------
# 7. INITIALIZE EMPTY NESTED LAYOUTS
# --------------------------------------------------

find src/app \
  -type f \
  -name "layout.tsx" \
  -empty \
  ! -path "src/app/layout.tsx" \
  -print0 |
while IFS= read -r -d '' file; do
  cat > "$file" <<'TSX'
import type { ReactNode } from "react";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({
  children,
}: LayoutProps) {
  return <>{children}</>;
}
TSX

  echo "Initialized layout: $file"
done

# --------------------------------------------------
# 8. INITIALIZE EMPTY API ROUTES
# --------------------------------------------------

find src/app/api -type f -name "route.ts" -empty -print0 |
while IFS= read -r -d '' file; do
  cat > "$file" <<'TS'
import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json(
    {
      message: "Endpoint not implemented",
    },
    {
      status: 501,
    },
  );
}
TS

  echo "Initialized API route: $file"
done

echo
echo "Build files repaired."
