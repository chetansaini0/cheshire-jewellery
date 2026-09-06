import { notFound } from "next/navigation";

const posts: Record<string, { title: string; body: string }> = {
  "how-to-style-silver-jewellery": {
    title: "How to Style Silver Jewellery",
    body: "Start with one signature chain. Add a fine layer. Finish with a single statement earring or ring. Keep metals consistent unless you’re intentionally contrasting finishes.",
  },
  "5-jewellery-pieces-everyone-needs": {
    title: "5 Jewellery Pieces Everyone Needs",
    body: "Signature chain, everyday hoops, stack ring, cuff, and one bold pendant. Build from these and edit seasonally.",
  },
  "best-jewellery-gifts-under-2000": {
    title: "Best Jewellery Gifts Under ₹2000",
    body: "Look for finish quality, wearability, and packaging — not just price. Hoops, fine chains, and minimal studs are safe, elevated picks.",
  },
};

type Props = { params: Promise<{ slug: string }> };

export default async function JournalPostPage({ params }: Props) {
  const { slug } = await params;
  const post = posts[slug];
  if (!post) notFound();
  return (
    <article className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="font-serif text-4xl md:text-5xl">{post.title}</h1>
      <p className="mt-8 text-base leading-relaxed text-muted">{post.body}</p>
    </article>
  );
}
