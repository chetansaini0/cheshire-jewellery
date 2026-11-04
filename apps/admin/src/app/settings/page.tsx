import { PageHeader, Panel, Pill } from "@/components/ui";
import { authMode } from "@/lib/auth";
import { getSettings } from "@/lib/settings";
import { adminDataDir } from "@/lib/store";
import { SettingsForm } from "./SettingsForm";

export const metadata = { title: "Settings" };

export default function SettingsPage() {
  const mode = authMode();
  return (
    <div>
      <PageHeader
        eyebrow="System"
        title="Settings"
        subtitle="Store basics and limits used across the admin (low-stock alerts, delivery charges). Payment keys and passwords live in environment variables, never on this page."
      />
      <SettingsForm settings={getSettings()} dataDir={adminDataDir()} />
      <Panel className="mt-6" title="Sign-in & security" tag={<Pill tone={mode === "on" ? "green" : "amber"}>{mode === "on" ? "password on" : "no password"}</Pill>}>
        <div className="space-y-2 text-sm text-muted">
          {mode === "on" ? (
            <p>The admin asks for a password. Sessions last 7 days; use the sign-out button (top right) on shared computers.</p>
          ) : (
            <p>
              No admin password is set, so this admin is open. That&apos;s fine on your own computer. Online, the admin stays locked until a password is set.
            </p>
          )}
          <p>
            To change the password, update the <code>ADMIN_PASSWORD</code> environment variable (locally in <code>apps/admin/.env.local</code>; online in Vercel →
            cheshire-admin → Settings → Environment Variables) and redeploy. Changing it signs everyone out.
          </p>
        </div>
      </Panel>
    </div>
  );
}
