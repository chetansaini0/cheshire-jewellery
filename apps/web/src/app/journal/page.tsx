import Link from "next/link";

const posts = [
  {
    slug: "how-to-style-silver-jewellery",
    title: "How to Style Silver Jewellery",
    excerpt: "Layer without clutter. Contrast without chaos.",
  },
  {
    slug: "5-jewellery-pieces-everyone-needs",
    title: "5 Jewellery Pieces Everyone Needs",
    excerpt: "Build a wardrobe that works harder than trends.",
  },
  {
    slug: "best-jewellery-gifts-under-2000",
    title: "Best Jewellery Gifts Under ₹2000",
    excerpt: "Gifts that feel premium without the premium panic.",
  },
];

export default function JournalPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="font-serif text-4xl">Journal</h1>
      <div className="mt-10 space-y-6">
        {posts.map((p) => (
          <article key={p.slug} className="border-b border-line pb-6">
            <h2 className="font-serif text-2xl">
              <Link href={`/journal/${p.slug}`}>{p.title}</Link>
            </h2>
            <p className="mt-2 text-sm text-muted">{p.excerpt}</p>
          </article>
        ))}
      </div>
    </div>
  );
}
