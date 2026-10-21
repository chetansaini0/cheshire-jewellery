import { productImage } from "@cheshire/database/catalog";

export type MoodPin = {
  id: string;
  title: string;
  mood: string;
  href: string;
  imageId: string;
  aspect: "tall" | "square" | "wide";
  credit: string;
};

/** Editorial references. Unsplash IDs verified 200 on 2026-10-21. */
export const inspirationPins: MoodPin[] = [
  { id: "pin-01", title: "Monochrome layers", mood: "DARK", href: "/shop?mood=dark", imageId: "photo-1521223890158-f9f7c3d5d504", aspect: "tall", credit: "Unsplash" },
  { id: "pin-02", title: "Weekend denim", mood: "EVERYDAY", href: "/shop/denim", imageId: "photo-1542272604-787c3835535d", aspect: "square", credit: "Unsplash" },
  { id: "pin-03", title: "Colour pop", mood: "BOLD", href: "/shop?mood=bold", imageId: "photo-1578587018452-892bacefd3f2", aspect: "tall", credit: "Unsplash" },
  { id: "pin-04", title: "Trench season", mood: "MINIMAL", href: "/shop/outerwear", imageId: "photo-1539533018447-63fcce2678e3", aspect: "wide", credit: "Unsplash" },
  { id: "pin-05", title: "Graphic tee energy", mood: "STATEMENT", href: "/shop/tees", imageId: "photo-1503341504253-dff4815485f1", aspect: "square", credit: "Unsplash" },
  { id: "pin-06", title: "Night shift", mood: "DARK", href: "/shop?mood=dark", imageId: "photo-1520975954732-35dd22299614", aspect: "tall", credit: "Unsplash" },
  { id: "pin-07", title: "Summer cut", mood: "ROMANTIC", href: "/shop/dresses", imageId: "photo-1515372039744-b8f02a3ae446", aspect: "tall", credit: "Unsplash" },
  { id: "pin-08", title: "Track set", mood: "BOLD", href: "/shop/co-ords", imageId: "photo-1509631179647-0177331693ae", aspect: "square", credit: "Unsplash" },
  { id: "pin-09", title: "Hoodie weather", mood: "EVERYDAY", href: "/shop/hoodies", imageId: "photo-1556821840-3a63f95609a7", aspect: "wide", credit: "Unsplash" },
  { id: "pin-10", title: "Tailored ease", mood: "MINIMAL", href: "/shop/co-ords", imageId: "photo-1617137968427-85924c800a22", aspect: "tall", credit: "Unsplash" },
  { id: "pin-11", title: "Red alert", mood: "STATEMENT", href: "/shop/dresses", imageId: "photo-1595777457583-95e059d581b8", aspect: "square", credit: "Unsplash" },
  { id: "pin-12", title: "Finishing moves", mood: "EVERYDAY", href: "/shop/accessories", imageId: "photo-1608667508764-33cf0726b13a", aspect: "wide", credit: "Unsplash" },
];

/** Lifestyle frames for community / lookbook grids */
export const lifestyleShots = [
  { id: "photo-1529139574466-a303027c1d8b", label: "Red on red" },
  { id: "photo-1488161628813-04466f872be2", label: "Sky high" },
  { id: "photo-1487222477894-8943e31ef7b2", label: "City tailoring" },
  { id: "photo-1483985988355-763728e1935b", label: "Winter edit" },
  { id: "photo-1485968579580-b6d095142e6e", label: "Plaid days" },
  { id: "photo-1503342217505-b0a15ec3261c", label: "Peace out" },
  { id: "photo-1469334031218-e382a71b716b", label: "Sunny side" },
  { id: "photo-1618517351616-38fb9c5210c6", label: "Street black" },
  { id: "photo-1622445275463-afa2ab738c34", label: "Cap and tee" },
  { id: "photo-1544022613-e87ca75a784a", label: "Utility" },
  { id: "photo-1581044777550-4cfa60707c03", label: "Soft frills" },
  { id: "photo-1552374196-1ab2a1c593e8", label: "Camel mood" },
  { id: "photo-1517841905240-472988babdf9", label: "Hood up" },
  { id: "photo-1554568218-0f1715e72254", label: "Tee tuck" },
  { id: "photo-1509631179647-0177331693ae", label: "Track ready" },
  { id: "photo-1572804013309-59a88b7e92f1", label: "Twirl" },
];

export function pinSrc(imageId: string, w = 800) {
  return productImage(imageId, w);
}
