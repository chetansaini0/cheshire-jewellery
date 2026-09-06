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

/**
 * Pinterest-inspired editorial references.
 * Uses Unsplash (license-free for commercial use) — not scraped Pinterest pins.
 * Swap imageIds for Cloudinary / studio photography anytime.
 */
export const inspirationPins: MoodPin[] = [
  {
    id: "pin-01",
    title: "Layered silver story",
    mood: "EVERYDAY",
    href: "/shop?mood=everyday",
    imageId: "photo-1515562141207-7a88fb7ce338",
    aspect: "tall",
    credit: "Unsplash",
  },
  {
    id: "pin-02",
    title: "Quiet ring stack",
    mood: "MINIMAL",
    href: "/shop?mood=minimal",
    imageId: "photo-1605100804763-247f67b3557e",
    aspect: "square",
    credit: "Unsplash",
  },
  {
    id: "pin-03",
    title: "Neckline architecture",
    mood: "STATEMENT",
    href: "/shop?mood=statement",
    imageId: "photo-1599643478518-a784e5dc4c8f",
    aspect: "tall",
    credit: "Unsplash",
  },
  {
    id: "pin-04",
    title: "Hoops after dark",
    mood: "BOLD",
    href: "/shop?mood=bold",
    imageId: "photo-1535632066927-ab7c9ab60908",
    aspect: "wide",
    credit: "Unsplash",
  },
  {
    id: "pin-05",
    title: "Chain with weight",
    mood: "EVERYDAY",
    href: "/shop/chains",
    imageId: "photo-1611591437281-460bfbe1220a",
    aspect: "square",
    credit: "Unsplash",
  },
  {
    id: "pin-06",
    title: "Wrist punctuation",
    mood: "BOLD",
    href: "/shop/bracelets",
    imageId: "photo-1611652022419-a9419f74343d",
    aspect: "tall",
    credit: "Unsplash",
  },
  {
    id: "pin-07",
    title: "Soft metal light",
    mood: "ROMANTIC",
    href: "/shop?mood=romantic",
    imageId: "photo-1617038260897-41a1f14a8ca0",
    aspect: "square",
    credit: "Unsplash",
  },
  {
    id: "pin-08",
    title: "Noir finish",
    mood: "DARK",
    href: "/shop?mood=dark",
    imageId: "photo-1602173574767-37ac0192322a",
    aspect: "tall",
    credit: "Unsplash",
  },
  {
    id: "pin-09",
    title: "Bare ankle detail",
    mood: "ROMANTIC",
    href: "/shop/anklets",
    imageId: "photo-1573408301185-91496afab032",
    aspect: "wide",
    credit: "Unsplash",
  },
  {
    id: "pin-10",
    title: "Drop earring drama",
    mood: "STATEMENT",
    href: "/shop/earrings",
    imageId: "photo-1617038220319-276d3cfab638",
    aspect: "tall",
    credit: "Unsplash",
  },
  {
    id: "pin-11",
    title: "Band essentials",
    mood: "MINIMAL",
    href: "/shop/rings",
    imageId: "photo-1603561591411-07134e71a2a9",
    aspect: "square",
    credit: "Unsplash",
  },
  {
    id: "pin-12",
    title: "Complete the set",
    mood: "STATEMENT",
    href: "/shop/sets",
    imageId: "photo-1515562141207-7a88fb7ce338",
    aspect: "wide",
    credit: "Unsplash",
  },
];

/** Extra lifestyle frames for community / worn-by grids */
export const lifestyleShots = [
  { id: "photo-1515562141207-7a88fb7ce338", label: "Layered look" },
  { id: "photo-1617038260897-41a1f14a8ca0", label: "Editorial neckline" },
  { id: "photo-1535632066927-ab7c9ab60908", label: "Hoops in light" },
  { id: "photo-1605100804763-247f67b3557e", label: "Ring close-up" },
  { id: "photo-1599643478518-a784e5dc4c8f", label: "Pendant mood" },
  { id: "photo-1611591437281-460bfbe1220a", label: "Chain detail" },
  { id: "photo-1611652022419-a9419f74343d", label: "Bracelet stack" },
  { id: "photo-1602173574767-37ac0192322a", label: "Metal texture" },
  { id: "photo-1573408301185-91496afab032", label: "Anklet moment" },
  { id: "photo-1617038220319-276d3cfab638", label: "Ear detail" },
  { id: "photo-1603561591411-07134e71a2a9", label: "Band study" },
  { id: "photo-1522312346375-d1a52e2b99b3", label: "Watch & metal" },
  { id: "photo-1506630448383-2b162b10d75b", label: "Fashion crop" },
  { id: "photo-1487412720507-e7ab37603c6f", label: "Portrait energy" },
  { id: "photo-1469334031218-e382a71b716b", label: "Runway calm" },
  { id: "photo-1490481651871-ab68de25d43d", label: "Editorial fashion" },
];

export function pinSrc(imageId: string, w = 800) {
  return productImage(imageId, w);
}
