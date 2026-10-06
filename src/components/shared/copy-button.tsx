"use client";

import { useState } from "react";

import { Icon } from "@/features/home/components/icon";

export function CopyButton({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      // Clipboard can be blocked (insecure context, permissions); the value stays selectable.
    }
  }

  return (
    <span className="relative inline-flex">
      <button type="button" onClick={copy} aria-label={label} className="btn btn-icon">
        <Icon name={copied ? "check" : "copy"} className="h-4 w-4" />
      </button>
      <span role="status" className={copied ? "tooltip absolute bottom-full left-1/2 mb-1 -translate-x-1/2 whitespace-nowrap" : "sr-only"}>
        {copied ? "Copied" : ""}
      </span>
    </span>
  );
}
