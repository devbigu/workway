"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";

import { Icon } from "@/features/home/components/icon";

import { addressSchema, type AddressInput } from "@/features/checkout/schemas";
import type { CheckoutAddress } from "@/features/checkout/types";

type Props = {
  initial?: CheckoutAddress;
  onSaved: (address: CheckoutAddress) => void;
  onCancel?: () => void;
};

const fields: Array<{ name: keyof AddressInput; label: string; optional?: boolean; wide?: boolean; autoComplete?: string; inputMode?: "text" | "tel" | "numeric" }> = [
  { name: "fullName", label: "Full name", wide: true, autoComplete: "name" },
  { name: "phone", label: "Phone number", wide: true, autoComplete: "tel", inputMode: "tel" },
  { name: "addressLine1", label: "Address line 1", wide: true, autoComplete: "address-line1" },
  { name: "addressLine2", label: "Address line 2", optional: true, wide: true, autoComplete: "address-line2" },
  { name: "landmark", label: "Landmark", optional: true, wide: true },
  { name: "city", label: "City", autoComplete: "address-level2" },
  { name: "state", label: "State", autoComplete: "address-level1" },
  { name: "postalCode", label: "Postal / PIN code", autoComplete: "postal-code", inputMode: "text" },
  { name: "country", label: "Country", autoComplete: "country-name" },
];

export function AddressForm({ initial, onSaved, onCancel }: Props) {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState("");
  const [saving, setSaving] = useState(false);
  const summaryRef = useRef<HTMLDivElement>(null);
  const errorList = fields.filter(({ name }) => errors[name]);

  useEffect(() => {
    if (Object.keys(errors).length) summaryRef.current?.focus();
  }, [errors]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setServerError("");
    const form = new FormData(event.currentTarget);
    const raw = Object.fromEntries(fields.map(({ name }) => [name, String(form.get(name) ?? "")]));
    raw.type = String(form.get("type") ?? "HOME");
    const parsed = addressSchema.safeParse(raw);
    if (!parsed.success) {
      const nextErrors: Record<string, string> = {};
      for (const issue of parsed.error.issues) nextErrors[String(issue.path[0])] ??= issue.message;
      setErrors(nextErrors);
      return;
    }

    setErrors({});
    setSaving(true);
    const makeDefault = form.get("makeDefault") === "on";
    const body = initial
      ? { address: parsed.data, makeDefault }
      : { address: parsed.data, saveForFuture: form.get("saveForFuture") === "on", makeDefault };
    try {
      const response = await fetch(initial ? `/api/addresses/${initial.id}` : "/api/addresses", {
        method: initial ? "PATCH" : "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      });
      const result = await response.json() as { address?: CheckoutAddress; error?: string };
      if (!response.ok || !result.address) throw new Error(result.error ?? "Unable to save this address");
      onSaved(result.address);
    } catch (error) {
      setServerError(error instanceof Error ? error.message : "Unable to save this address");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={submit} noValidate aria-labelledby="address-form-title">
      <div className="flex items-start justify-between gap-4">
        <h2 id="address-form-title" className="subsection">{initial ? "Edit address" : "Add a delivery address"}</h2>
        {onCancel && <button type="button" onClick={onCancel} className="btn btn-text -mt-3 text-sm">Cancel</button>}
      </div>

      {errorList.length > 0 && (
        <div ref={summaryRef} tabIndex={-1} role="alert" className="alert alert-error mt-5">
          <Icon name="alert" />
          <div>
            <p className="font-medium">Check {errorList.length === 1 ? "this field" : `these ${errorList.length} fields`}:</p>
            <ul className="mt-1 grid gap-1">
              {errorList.map(({ name, label }) => <li key={name}><a href={`#address-${name}`} className="link">{label}</a>: {errors[name]}</li>)}
            </ul>
          </div>
        </div>
      )}

      <div className="mt-6 grid gap-5 sm:grid-cols-2">
        {fields.map((field) => {
          const id = `address-${field.name}`;
          const error = errors[field.name];
          return (
            <div key={field.name} className={`field ${field.wide ? "sm:col-span-2" : ""}`}>
              <label htmlFor={id} className="field-label">
                {field.label}{field.optional && <span className="field-optional"> (optional)</span>}
              </label>
              <input
                id={id}
                name={field.name}
                defaultValue={initial?.[field.name] ?? (field.name === "country" ? "India" : "")}
                autoComplete={field.autoComplete}
                inputMode={field.inputMode}
                aria-invalid={Boolean(error)}
                aria-describedby={error ? `${id}-error` : undefined}
                className="input"
              />
              {error && <p id={`${id}-error`} className="field-error">{error}</p>}
            </div>
          );
        })}
        <fieldset className="sm:col-span-2">
          <legend className="field-label">Address type</legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {(["HOME", "WORK", "OTHER"] as const).map((type) => (
              <label key={type} className="choice rounded-full border border-line-strong bg-surface px-4 text-sm has-[:checked]:border-ink">
                <input className="radio" type="radio" name="type" value={type} defaultChecked={(initial?.type ?? "HOME") === type} />
                <span className="capitalize">{type.toLowerCase()}</span>
              </label>
            ))}
          </div>
        </fieldset>
      </div>

      <div className="mt-6 grid gap-1 border-t border-line pt-4">
        {!initial && <label className="choice text-sm"><input name="saveForFuture" type="checkbox" defaultChecked className="check" /><span>Save this address for future orders</span></label>}
        <label className="choice text-sm"><input name="makeDefault" type="checkbox" defaultChecked={initial?.isDefault} className="check" /><span>Make this my default address</span></label>
      </div>

      {serverError && (
        <div role="alert" className="alert alert-error mt-4">
          <Icon name="alert" />
          <p>{serverError}</p>
        </div>
      )}

      <button disabled={saving} aria-busy={saving} className="btn btn-primary btn-lg btn-block mt-6">
        {saving && <span className="spinner" aria-hidden="true" />}
        {initial ? "Save changes" : "Save and use this address"}
      </button>
    </form>
  );
}
