import { PageHeader } from "./ui";

/** Legacy section that is not wired to a data source yet. */
export default function Page({ title, children }: { title: string; children?: React.ReactNode }) {
  return (
    <div>
      <PageHeader title={title} eyebrow="Not wired yet" />
      <div className="card p-6 text-sm text-muted">
        {children || `${title} management is planned for API integration (Prisma + admin routes). No data source is connected yet.`}
      </div>
    </div>
  );
}
