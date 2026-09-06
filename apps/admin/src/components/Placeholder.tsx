export default function Page({ title, children }: { title: string; children?: React.ReactNode }) {
  return (
    <div>
      <h1 className="text-2xl font-semibold">{title}</h1>
      <div className="mt-6 border border-line bg-white p-6 text-sm text-muted">
        {children || `${title} management is wired for API integration (Prisma + admin routes).`}
      </div>
    </div>
  );
}
