import { redirect } from "next/navigation";
import { authMode, safeNext } from "@/lib/auth";
import { LoginForm } from "./LoginForm";

export const metadata = { title: "Sign in" };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  if (authMode() === "off") redirect("/");
  const { next } = await searchParams;
  return (
    <div className="grid min-h-screen place-items-center bg-[#0A0A0A] px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex items-center gap-3 text-[#F4F3EF]">
          <span className="grid h-10 w-10 place-items-center rounded-md bg-lime font-display text-2xl leading-none text-[#0A0A0A]">C</span>
          <span className="leading-none">
            <span className="block font-display text-2xl tracking-wide">CHESHIRE</span>
            <span className="mt-1 block text-[10px] font-semibold uppercase tracking-[0.3em] text-lime">Ops / Admin</span>
          </span>
        </div>
        <LoginForm next={safeNext(next)} />
        <p className="mt-6 text-center text-xs text-white/40">Private area. Ask the store owner for the admin password.</p>
      </div>
    </div>
  );
}
