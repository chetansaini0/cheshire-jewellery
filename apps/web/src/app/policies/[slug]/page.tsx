const policies: Record<string, { title: string; body: string }> = {
  privacy: {
    title: "Privacy Policy",
    body: "CHESHIRE collects account, order, and device information to fulfil purchases, personalize recommendations, and send opted-in notifications. We never sell personal data. Payment credentials are processed by Razorpay and never stored by CHESHIRE.",
  },
  terms: {
    title: "Terms of Service",
    body: "By using CHESHIRE websites and apps you agree to our commerce terms, acceptable use, and intellectual property policies. Product colours may vary slightly by display.",
  },
  refunds: {
    title: "Refund Policy",
    body: "Approved returns are refunded to the original payment method within 5–7 business days after quality check.",
  },
  returns: {
    title: "Returns & Exchanges",
    body: "Unused products in original packaging may be returned or exchanged within 7 days of delivery.",
  },
  shipping: {
    title: "Shipping Policy",
    body: "Free shipping on orders over ₹999. Standard delivery 3–6 business days across India. Dispatch typically within 24–48 hours.",
  },
};

type Props = { params: Promise<{ slug: string }> };

export default async function PolicyPage({ params }: Props) {
  const { slug } = await params;
  const policy = policies[slug];
  if (!policy) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-12">
        <h1 className="font-serif text-4xl">Policy</h1>
        <p className="mt-4 text-muted">Policy not found.</p>
      </div>
    );
  }
  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="font-serif text-4xl">{policy.title}</h1>
      <p className="mt-6 text-sm leading-relaxed text-muted">{policy.body}</p>
    </div>
  );
}
