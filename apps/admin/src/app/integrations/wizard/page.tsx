"use client";

import { useState, useTransition } from "react";
import { actionActivate, actionTestConnection, actionUpsert } from "@/lib/integration-actions";
import { useRouter } from "next/navigation";

const STEPS = [
  "Supplier details",
  "Integration method",
  "Credentials",
  "Test connection",
  "Capabilities",
  "Category mapping",
  "Content permissions",
  "Pricing rules",
  "Shipping / returns",
  "Test product",
  "Test order",
  "Activate",
];

export default function WizardPage() {
  const [step, setStep] = useState(0);
  const [supplierId, setSupplierId] = useState("sup-mock-hub");
  const [supplierName, setSupplierName] = useState("Cheshire Mock Hub");
  const [providerId, setProviderId] = useState("mock-jewellery-hub");
  const [baseUrl, setBaseUrl] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [integrationId, setIntegrationId] = useState("int-mock-hub");
  const [message, setMessage] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const router = useRouter();

  return (
    <div>
      <h1 className="text-2xl font-semibold">Integration wizard</h1>
      <p className="mt-1 text-sm text-muted">Twelve checks before a house can sell. Activation is blocked until readiness passes.</p>
      <ol className="mt-6 grid gap-1 text-xs uppercase tracking-[0.12em] text-muted sm:grid-cols-3">
        {STEPS.map((label, i) => (
          <li key={label} className={i === step ? "text-gold-deep" : ""}>
            {String(i + 1).padStart(2, "0")} {label}
          </li>
        ))}
      </ol>

      <div className="mt-8 border border-line bg-white p-6">
        {step === 0 && (
          <Fields>
            <label className="block text-sm">
              Supplier id
              <input className="mt-1 mb-3 block w-full border border-line bg-white px-3 py-2" value={supplierId} onChange={(e) => setSupplierId(e.target.value)} />
            </label>
            <label className="block text-sm">
              Brand name
              <input className="mt-1 mb-3 block w-full border border-line bg-white px-3 py-2" value={supplierName} onChange={(e) => setSupplierName(e.target.value)} />
            </label>
          </Fields>
        )}
        {step === 1 && (
          <label className="block text-sm">
            Method
            <select className="mt-1 block w-full border border-line bg-white px-3 py-2" value={providerId} onChange={(e) => setProviderId(e.target.value)}>
              <option value="mock-jewellery-hub">Mock apparel hub (sandbox)</option>
              <option value="manual">Manual / email</option>
              <option value="csv">CSV</option>
              <option value="generic-api">Generic API (pending)</option>
              <option value="shopify">Shopify (pending)</option>
              <option value="woocommerce">WooCommerce (pending)</option>
            </select>
          </label>
        )}
        {step === 2 && (
          <Fields>
            <p className="text-sm text-muted">Leave blank for mock/manual. Keys are encrypted at rest and never shown to customers.</p>
            <label className="block text-sm">
              Base URL
              <input className="mt-1 mb-3 block w-full border border-line bg-white px-3 py-2" value={baseUrl} onChange={(e) => setBaseUrl(e.target.value)} placeholder="https://" />
            </label>
            <label className="block text-sm">
              API key
              <input className="mt-1 mb-3 block w-full border border-line bg-white px-3 py-2" type="password" value={apiKey} onChange={(e) => setApiKey(e.target.value)} />
            </label>
          </Fields>
        )}
        {step === 3 && <p className="text-sm">Use Test connection on the next action. Pending HTTP adapters will report Integration pending — that is correct.</p>}
        {step >= 4 && step <= 10 && (
          <p className="text-sm text-muted">
            Step {step + 1}: {STEPS[step]}. Configure the remaining policy on the supplier integration page after saving.
            Mock hub already includes 20% margin, category maps, and sandbox orders.
          </p>
        )}
        {step === 11 && <p className="text-sm">Activation requires connected integration, compliance, and content rights.</p>}

        {message ? <p className="mt-4 text-sm">{message}</p> : null}

        <div className="mt-6 flex flex-wrap gap-2">
          {step > 0 ? (
            <button className="border border-line px-3 py-2 text-xs uppercase tracking-[0.14em]" onClick={() => setStep((s) => s - 1)}>
              Back
            </button>
          ) : null}
          {step === 2 ? (
            <button
              className="border border-gold px-3 py-2 text-xs uppercase tracking-[0.14em]"
              disabled={pending}
              onClick={() =>
                start(async () => {
                  const row = await actionUpsert({
                    supplierId,
                    supplierName,
                    providerId,
                    credentials: baseUrl || apiKey ? { baseUrl, apiKey } : undefined,
                  });
                  setIntegrationId(row.id);
                  setMessage(`Saved ${row.id} · ${row.status}`);
                  setStep(3);
                })
              }
            >
              Save integration
            </button>
          ) : null}
          {step === 3 ? (
            <button
              className="border border-gold px-3 py-2 text-xs uppercase tracking-[0.14em]"
              disabled={pending}
              onClick={() =>
                start(async () => {
                  const result = await actionTestConnection(integrationId);
                  setMessage(`${result.status}: ${result.message}`);
                  if (result.status === "CONNECTED") setStep(4);
                })
              }
            >
              Test connection
            </button>
          ) : null}
          {step === 11 ? (
            <button
              className="border border-gold px-3 py-2 text-xs uppercase tracking-[0.14em]"
              disabled={pending}
              onClick={() =>
                start(async () => {
                  const result = await actionActivate(integrationId);
                  setMessage(JSON.stringify(result));
                  if (result.ok) router.push(`/suppliers/${supplierId}/integration`);
                })
              }
            >
              Activate supplier
            </button>
          ) : null}
          {step !== 2 && step !== 3 && step < 11 ? (
            <button className="border border-gold px-3 py-2 text-xs uppercase tracking-[0.14em]" onClick={() => setStep((s) => s + 1)}>
              Continue
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function Fields({ children }: { children: React.ReactNode }) {
  return <div className="max-w-lg space-y-2 text-sm">{children}</div>;
}
