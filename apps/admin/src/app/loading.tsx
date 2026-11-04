export default function Loading() {
  return (
    <div className="animate-pulse" aria-busy="true" aria-live="polite">
      <span className="sr-only">Loading…</span>
      <div className="mb-6 space-y-3">
        <div className="h-3 w-24 rounded bg-ink/10" />
        <div className="h-9 w-64 rounded bg-ink/10" />
        <div className="h-3 w-full max-w-xl rounded bg-ink/10" />
      </div>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="card h-24" />
        ))}
      </div>
      <div className="card mt-6 h-72" />
    </div>
  );
}
