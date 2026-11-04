import tokenJson from "../tokens.json";

/** Typed design tokens for TS code (charts, OG images, inline styles). Same values as the Tailwind preset. */
export const tokens = tokenJson;
export type ColorToken = keyof typeof tokenJson.colors;
