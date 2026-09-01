export const site = {
  /** Urdu title — the primary identity. */
  nameUr: "نغماتِ محامد",
  /** Romanised wordmark, used in <title> and the footer. */
  nameLatin: "Naghmat e Muhaamid",
  taglineUr: "حمد و نعت و منقبت کا ایک منتخب دیوان",
  descriptionUr:
    "حمد، نعت، منقبت، سلام، مناجات اور متفرقات — محمد سبطر رضا قادری اختری کے کلام کا مجموعہ۔",
  descriptionLatin:
    "The collected devotional verse of Muhammad Sibtar Raza Qadri Akhtari — Hamd, Naat, Manqabat, Salaam, Munajaat and more.",
  /**
   * The collection has exactly one poet, so attribution lives here — once —
   * instead of on every kalam row. Individual poems carry no author field:
   * repeating it per-row invites contradiction and implies the diwan is an
   * anthology, which it is not.
   */
  poet: {
    titlesUr: "ثنا خوانِ رسول، گدائے اہلِ بیت، قادری فقیر",
    nameUr: "محمد سبطر رضا قادری اختری",
    nameLatin: "Muhammad Sibtar Raza Qadri Akhtari",
  },
  /** Formal one-line credit, used under each kalam and in shared text. */
  creditUr: "کلام: محمد سبطر رضا قادری اختری",
} as const;

/**
 * Absolute origin for OpenGraph URLs and sitemap.xml. Falls back to the
 * Vercel-provided host so preview deployments still emit valid absolute URLs.
 */
export function siteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  if (explicit) return explicit.replace(/\/$/, "");
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  }
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3000";
}
