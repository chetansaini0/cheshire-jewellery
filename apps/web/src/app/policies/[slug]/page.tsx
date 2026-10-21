const policies: Record<string, { title: string; body: string[] }> = {
  "size-guide": {
    title: "Size Guide",
    body: [
      "Tops (chest, inches): S 38–40 · M 40–42 · L 42–44 · XL 44–46. Our tees and hoodies are cut relaxed; size down for a regular fit, size up for oversized.",
      "Denim (waist, inches): 28 · 30 · 32 · 34 · 36. Rigid denim relaxes about half a size with wear.",
      "Dresses: S (UK 8) · M (UK 10) · L (UK 12) · XL (UK 14). Sneakers are true to UK size. Not sure? Size exchanges are free within 7 days.",
    ],
  },
  privacy: {
    title: "Privacy Policy",
    body: [
      "CHESHIRE collects account, order, and device information to fulfil purchases, personalize recommendations, and send opted-in notifications. We never sell personal data. Payment credentials are processed by Razorpay and never stored by CHESHIRE.",
      "Suppliers receive only the shipping details required to fulfil their orders. They do not receive your full account history.",
    ],
  },
  terms: {
    title: "Terms & Conditions",
    body: [
      "By using CHESHIRE websites and apps you agree to our commerce terms, acceptable use, and intellectual property policies. Product colours may vary slightly by display.",
      "CHESHIRE is a clothing and streetwear label. Items may be fulfilled by Cheshire, by a dropship partner, or by a marketplace label. The customer experience remains CHESHIRE.",
    ],
  },
  refunds: {
    title: "Refund Policy",
    body: [
      "Approved returns are refunded to the original payment method within 5–7 business days after quality check.",
      "Marketplace and dropship refunds are coordinated by CHESHIRE. The supplying label handles the physical return.",
    ],
  },
  returns: {
    title: "Return & Refund Policy",
    body: [
      "Unworn items with tags attached may be returned or exchanged within 7 days of delivery.",
      "Return flow: Requested → Approved → Pickup scheduled → Picked up → Received → Inspection → Refund initiated → Refunded. Requests may also be rejected with a reason.",
    ],
  },
  shipping: {
    title: "Shipping Policy",
    body: [
      "Free shipping on orders over ₹999 unless a supplier zone specifies otherwise. Standard delivery is typically 3–6 business days across India.",
      "Delivery windows shown on product pages are estimates from the fulfilling warehouse.",
    ],
  },
  "affiliate-disclosure": {
    title: "Affiliate Disclosure",
    body: [
      "Some items in the CHESHIRE edit are sold by partner labels. When you choose Buy from Partner, you complete purchase on the partner’s website.",
      "CHESHIRE may earn a commission on those referrals. This does not change the price you see. We only feature partners whose products meet our quality standard.",
      "CHESHIRE does not claim to manufacture every item shown.",
    ],
  },
  "supplier-terms": {
    title: "Supplier Terms",
    body: [
      "Approved suppliers may list clothing on CHESHIRE after catalogue review. Suppliers remain responsible for inventory accuracy, fulfilment, and returns on their orders.",
      "Cheshire commissions are configured in admin and cannot be changed by supplier accounts.",
    ],
  },
  "marketplace-terms": {
    title: "Marketplace Terms",
    body: [
      "Marketplace products are sold by approved labels through CHESHIRE checkout. Cheshire collects payment, retains commission, and pays out the supplier according to the payout schedule.",
      "Customers contract with CHESHIRE for the purchase experience. Fulfilment is performed by the listed label.",
    ],
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
      {policy.body.map((p) => (
        <p key={p.slice(0, 40)} className="mt-6 text-sm leading-relaxed text-muted">
          {p}
        </p>
      ))}
    </div>
  );
}
