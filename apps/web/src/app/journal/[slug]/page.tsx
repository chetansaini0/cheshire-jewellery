import { notFound } from "next/navigation";

const posts: Record<string, { title: string; body: string }> = {
  "how-to-style-baggy-jeans": {
    title: "How to Style Baggy Jeans",
    body: "Balance the volume: a fitted or cropped top over wide denim, then a chunky sneaker to anchor the leg. Tuck the front, cuff once, and let the hem break naturally.",
  },
  "5-wardrobe-pieces-everyone-needs": {
    title: "5 Wardrobe Pieces Everyone Needs",
    body: "A heavyweight white tee, a grey hoodie, straight raw denim, a camel trench and one bold sneaker. Build from these and add a drop each season.",
  },
  "best-clothing-gifts-under-2000": {
    title: "Best Clothing Gifts Under ₹2000",
    body: "Look for finish quality, wearability, and packaging — not just price. Washed caps, essential tee packs and crew sweatshirts are safe, elevated picks.",
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
