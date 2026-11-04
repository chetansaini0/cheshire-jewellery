"use client";

import { useActionState, useState } from "react";
import { Icon } from "@/components/Icon";
import { loginAction, type LoginState } from "@/lib/auth-actions";

export function LoginForm({ next }: { next: string }) {
  const [state, action, pending] = useActionState<LoginState, FormData>(loginAction, {});
  const [show, setShow] = useState(false);
  return (
    <form action={action} className="card space-y-4 p-6">
      <div>
        <h1 className="font-display text-3xl uppercase tracking-wide">Sign in</h1>
        <p className="mt-1 text-sm text-muted">Enter the admin password to manage your store.</p>
      </div>
      <input type="hidden" name="next" value={next} />
      <div>
        <label className="label" htmlFor="password">Admin password</label>
        <div className="relative">
          <input
            id="password"
            name="password"
            type={show ? "text" : "password"}
            autoComplete="current-password"
            autoFocus
            required
            className={`input pr-10 ${state.error ? "!border-red-500" : ""}`}
            aria-invalid={Boolean(state.error)}
            aria-describedby={state.error ? "login-error" : undefined}
          />
          <button
            type="button"
            onClick={() => setShow((v) => !v)}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-muted hover:text-ink"
            aria-label={show ? "Hide password" : "Show password"}
          >
            <Icon name={show ? "eyeOff" : "eye"} />
          </button>
        </div>
        {state.error ? (
          <p id="login-error" role="alert" className="mt-1.5 text-sm text-red-600">
            {state.error}
          </p>
        ) : null}
      </div>
      <button className="btn-lime w-full py-3" disabled={pending}>
        <Icon name="lock" /> {pending ? "Checking…" : "Sign in"}
      </button>
    </form>
  );
}
