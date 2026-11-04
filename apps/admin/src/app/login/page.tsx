import { redirect } from "next/navigation";
import { authMode, safeNext } from "@/lib/auth";
import { LoginForm } from "./LoginForm";

export const metadata = { title: "Sign in" };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  if (authMode() === "off") redirect("/");
  const { next } = await searchParams;
  return (
    <div className="grid min-h-screen place-items-center bg-bg px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <span className="block font-serif text-4xl font-semibold tracking-[0.18em] text-ink">CHESHIRE</span>
          <span className="mt-2 block text-[10px] font-semibold uppercase tracking-[0.3em] text-gold">Admin · Roots. Remixed.</span>
        </div>
        <LoginForm next={safeNext(next)} />
        <p className="mt-6 text-center text-xs text-muted">Private area. Ask the store owner for the admin password.</p>
      </div>
    </div>
  );
}
