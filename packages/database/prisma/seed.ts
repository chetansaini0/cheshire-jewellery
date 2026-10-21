import { PrismaClient, ProductBadge } from "@prisma/client";
import {
  calcDiscount,
  categories,
  collections,
  productImage,
  seedProducts,
} from "../src/catalog";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding CHESHIRE catalogue...");

  await prisma.orderItem.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.affiliateConversion.deleteMany().catch(() => undefined);
  await prisma.affiliateClick.deleteMany().catch(() => undefined);
  await prisma.refund.deleteMany().catch(() => undefined);
  await prisma.returnRequest.deleteMany().catch(() => undefined);
  await prisma.shipment.deleteMany().catch(() => undefined);
  await prisma.supplierOrder.deleteMany().catch(() => undefined);
  await prisma.payout.deleteMany().catch(() => undefined);
  await prisma.commissionLedger.deleteMany().catch(() => undefined);
  await prisma.commissionRule.deleteMany().catch(() => undefined);
  await prisma.shippingZone.deleteMany().catch(() => undefined);
  await prisma.commerceEvent.deleteMany().catch(() => undefined);
  await prisma.analyticsEvent.deleteMany().catch(() => undefined);
  await prisma.order.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.wishlistItem.deleteMany();
  await prisma.review.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.productVariant.deleteMany();
  await prisma.inventoryLog.deleteMany();
  await prisma.recentlyViewed.deleteMany();
  await prisma.product.deleteMany();
  await prisma.shippingZone.deleteMany().catch(() => undefined);
  await prisma.supplier.deleteMany().catch(() => undefined);
  await prisma.affiliatePartner.deleteMany().catch(() => undefined);
  await prisma.subcategory.deleteMany().catch(() => undefined);
  await prisma.category.deleteMany();
  await prisma.collection.deleteMany();
  await prisma.coupon.deleteMany();
  await prisma.announcement.deleteMany();
  await prisma.store.deleteMany();
  await prisma.faq.deleteMany();
  await prisma.blogPost.deleteMany();
  await prisma.cmsSection.deleteMany();
  await prisma.rewardRule.deleteMany();

  const categoryMap = new Map<string, string>();
  for (const [i, c] of categories.entries()) {
    const row = await prisma.category.create({
      data: {
        name: c.name,
        slug: c.slug,
        imageUrl: c.imageUrl,
        sortOrder: i,
        description: `${c.name} by CHESHIRE`,
      },
    });
    categoryMap.set(c.slug, row.id);
  }

  const collectionMap = new Map<string, string>();
  for (const c of collections) {
    const row = await prisma.collection.create({
      data: {
        name: c.name,
        slug: c.slug,
        description: c.description,
        isFeatured: true,
      },
    });
    collectionMap.set(c.slug, row.id);
  }

  const xyz = await prisma.affiliatePartner.upsert({
    where: { slug: "brand-xyz" },
    update: {},
    create: {
      name: "Brand XYZ",
      slug: "brand-xyz",
      network: "direct",
      website: "https://partner-example.com",
      defaultCommission: 8,
      status: "ACTIVE",
    },
  });

  const atelier = await prisma.supplier.upsert({
    where: { email: "atelier@lumen.example" },
    update: { status: "APPROVED" },
    create: {
      brandName: "Atelier Noir",
      slug: "atelier-noir",
      ownerName: "Aanya Shah",
      email: "atelier@lumen.example",
      phone: "+91 90000 11101",
      businessName: "Atelier Noir Private Limited",
      gstNumber: "27AABCL1234Q1Z5",
      addressLine1: "12 Kala Ghoda",
      city: "Mumbai",
      state: "Maharashtra",
      pincode: "400001",
      status: "APPROVED",
      commissionPercent: 12,
    },
  });

  await prisma.commissionRule.createMany({
    data: [
      { name: "Global apparel", scope: "GLOBAL", percent: 15, priority: 1 },
      { name: "Atelier Noir", scope: "SUPPLIER", percent: 12, priority: 40, supplierId: atelier.id },
    ],
  });

  for (const p of seedProducts) {
    const categoryId = categoryMap.get(p.category);
    if (!categoryId) throw new Error(`Missing category ${p.category}`);

    await prisma.product.create({
      data: {
        sku: p.sku,
        name: p.name,
        slug: p.slug,
        description: p.description,
        shortDescription: p.shortDescription,
        price: p.price,
        mrp: p.mrp,
        discountPercent: calcDiscount(p.price, p.mrp),
        categoryId,
        collectionId: p.collection ? collectionMap.get(p.collection) : undefined,
        material: p.material,
        color: p.color,
        moods: p.moods,
        occasions: p.occasions,
        tags: p.tags,
        badge: p.badge as ProductBadge | undefined,
        rating: p.rating,
        reviewCount: p.reviewCount,
        stock: p.stock,
        sizes: p.sizes,
        hoverImage: productImage(p.imageIds[1]),
        isPublished: true,
        isNew: Boolean(p.isNew),
        isBestseller: Boolean(p.isBestseller),
        productType:
          p.productType === "affiliate"
            ? "AFFILIATE"
            : p.productType === "marketplace"
              ? "MARKETPLACE"
              : "DROPSHIP",
        affiliatePartnerId: p.productType === "affiliate" ? xyz.id : undefined,
        supplierId: p.productType === "marketplace" ? atelier.id : undefined,
        stoneType: p.stoneType,
        weight: p.weight,
        dimensions: "See size guide",
        care: "Machine wash cold inside out. Do not tumble dry. Iron on reverse.",
        shippingInfo: "Dispatched in 24–48 hours. Free shipping over ₹999.",
        returnsInfo: "Easy 7-day returns on unused products with original packaging.",
        warranty: "30-day quality promise on seams and fabric.",
        seoTitle: `${p.name} | CHESHIRE`,
        seoDescription: p.shortDescription,
        images: {
          create: [
            {
              url: productImage(p.imageIds[0]),
              alt: p.name,
              sortOrder: 0,
              isPrimary: true,
            },
            {
              url: productImage(p.imageIds[1]),
              alt: `${p.name} alternate view`,
              sortOrder: 1,
              isPrimary: false,
            },
          ],
        },
        variants: {
          create: (p.sizes.length ? p.sizes : ["One Size"]).map((size, idx) => ({
            sku: `${p.sku}-${size.replace(/[^a-zA-Z0-9]/g, "").toUpperCase() || "OS"}`,
            size,
            color: p.color,
            material: p.material,
            price: p.price,
            mrp: p.mrp,
            stock: Math.max(2, Math.floor(p.stock / Math.max(1, p.sizes.length))),
            isDefault: idx === 0,
          })),
        },
      },
    });
  }

  await prisma.announcement.create({
    data: {
      message: "FREE SHIPPING ON ORDERS OVER ₹999",
      isActive: true,
      sortOrder: 0,
    },
  });

  await prisma.coupon.createMany({
    data: [
      {
        code: "CHESHIRE10",
        type: "PERCENTAGE",
        value: 10,
        minCartValue: 1499,
        maxDiscount: 500,
        isActive: true,
      },
      {
        code: "WELCOME199",
        type: "FLAT",
        value: 199,
        minCartValue: 999,
        isActive: true,
      },
      {
        code: "FREESHIP",
        type: "FREE_SHIPPING",
        value: 0,
        minCartValue: 499,
        isActive: true,
      },
      {
        code: "FIRSTORDER",
        type: "FIRST_ORDER",
        value: 15,
        minCartValue: 799,
        maxDiscount: 400,
        isActive: true,
      },
    ],
  });

  await prisma.rewardRule.createMany({
    data: [
      { name: "Purchase points", eventType: "PURCHASE", points: 1, description: "1 point per ₹100 spent" },
      { name: "Review bonus", eventType: "REVIEW", points: 50, description: "Write an approved review" },
      { name: "Referral", eventType: "REFERRAL", points: 200, description: "Successful referral" },
      { name: "Birthday", eventType: "BIRTHDAY", points: 150, description: "Birthday reward" },
      { name: "App purchase", eventType: "APP_PURCHASE", points: 25, description: "Bonus for app checkout" },
    ],
  });

  await prisma.store.createMany({
    data: [
      {
        name: "CHESHIRE Bandra",
        address: "14 Linking Road, Bandra West",
        city: "Mumbai",
        state: "Maharashtra",
        pincode: "400050",
        phone: "+91 22 4000 1101",
        openingHours: "11:00 AM – 9:00 PM",
        lat: 19.0596,
        lng: 72.8295,
      },
      {
        name: "CHESHIRE Khan Market",
        address: "32 Khan Market",
        city: "New Delhi",
        state: "Delhi",
        pincode: "110003",
        phone: "+91 11 4000 2202",
        openingHours: "11:00 AM – 9:00 PM",
        lat: 28.6002,
        lng: 77.2269,
      },
      {
        name: "CHESHIRE Indiranagar",
        address: "100 Feet Road, Indiranagar",
        city: "Bengaluru",
        state: "Karnataka",
        pincode: "560038",
        phone: "+91 80 4000 3303",
        openingHours: "11:00 AM – 9:30 PM",
        lat: 12.9784,
        lng: 77.6408,
      },
    ],
  });

  await prisma.faq.createMany({
    data: [
      {
        question: "What is your shipping policy?",
        answer: "Orders over ₹999 ship free across India. Standard delivery is 3–6 business days.",
        category: "Shipping",
        sortOrder: 1,
      },
      {
        question: "How do returns work?",
        answer: "Unused products can be returned within 7 days in original packaging for a refund or exchange.",
        category: "Returns",
        sortOrder: 2,
      },
      {
        question: "Are CHESHIRE pieces authentic?",
        answer: "Yes. Material details are listed on every product page and quality-checked before dispatch.",
        category: "Product",
        sortOrder: 3,
      },
      {
        question: "How do I redeem Cheshire Club points?",
        answer: "Open Account → Rewards to convert points into coupons and early-access benefits.",
        category: "Rewards",
        sortOrder: 4,
      },
    ],
  });

  await prisma.blogPost.createMany({
    data: [
      {
        title: "How to Style Baggy Jeans",
        slug: "how-to-style-baggy-jeans",
        excerpt: "Layer without clutter. Contrast without chaos.",
        content: "Start with a fitted top. Add a cropped jacket. Finish with chunky sneakers.",
        tags: ["style", "denim"],
        isPublished: true,
        publishedAt: new Date(),
        seoTitle: "How to Style Baggy Jeans | CHESHIRE",
        seoDescription: "A CHESHIRE guide to styling baggy denim with intention.",
      },
      {
        title: "5 Wardrobe Pieces Everyone Needs",
        slug: "5-wardrobe-pieces-everyone-needs",
        excerpt: "Build a wardrobe that works harder than trends.",
        content: "Heavyweight tee, grey hoodie, straight denim, a trench, and one bold sneaker.",
        tags: ["essentials", "edit"],
        isPublished: true,
        publishedAt: new Date(),
      },
      {
        title: "Best Clothing Gifts Under ₹2000",
        slug: "best-clothing-gifts-under-2000",
        excerpt: "Gifts that feel premium without the premium panic.",
        content: "Look for finish quality, wearability, and packaging — not just price.",
        tags: ["gifting", "under-2000"],
        isPublished: true,
        publishedAt: new Date(),
      },
    ],
  });

  await prisma.cmsSection.createMany({
    data: [
      {
        key: "hero",
        title: "Homepage Hero",
        content: {
          headline: "WEAR YOUR STORY.",
          supporting: "Streetwear made to be lived in.",
          ctaPrimary: { label: "SHOP NEW", href: "/shop?sort=newest" },
          ctaSecondary: { label: "EXPLORE CHESHIRE", href: "/about" },
          mediaUrl: productImage("photo-1445205170230-053b83016050", 1600),
          mediaType: "image",
        },
      },
      {
        key: "campaign",
        title: "Campaign",
        content: {
          headline: "DON'T FOLLOW THE LOOK.",
          supporting: "Create your own.",
          cta: { label: "SHOP NOW", href: "/shop" },
          mediaUrl: productImage("photo-1529139574466-a303027c1d8b", 1600),
        },
      },
    ],
  });

  const adminEmail = process.env.ADMIN_EMAIL || "admin@cheshire.com";
  await prisma.user.upsert({
    where: { email: adminEmail },
    update: { role: "ADMIN" },
    create: {
      email: adminEmail,
      name: "CHESHIRE Admin",
      role: "ADMIN",
      emailVerified: true,
      // password set via API bootstrap / bcrypt in api seed helper
    },
  });

  console.log(`Seeded ${seedProducts.length} products.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
