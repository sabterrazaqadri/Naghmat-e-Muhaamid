import { config } from "dotenv";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";

import { categories, kalam } from "./schema";
import { slugify } from "../lib/slugify";

config({ path: ".env.local" });

/**
 * ─────────────────────────────────────────────────────────────────────────
 * SEED CONTENT — PLACEHOLDER ONLY.
 *
 * The app presents this diwan as the work of one poet: there is no per-kalam
 * author field, and every page credits Muhammad Sibtar Raza Qadri Akhtari.
 * That makes the seed content a correctness problem, not just a cosmetic one.
 * An earlier version of this file seeded famous classical works — Imam Ahmad
 * Raza Khan's «مصطفیٰ جانِ رحمت پہ لاکھوں سلام», verses by Hali, Muhsin
 * Kakorvi, Amir Khusro and Iqbal — which, with author attribution removed,
 * would have appeared on the site as this poet's own. That is a real
 * misattribution of identifiable poets' work, so all of it has been removed.
 *
 * What remains is deliberately generic filler, written only to exercise the
 * UI with realistic Urdu text lengths and stanza breaks. It is nobody's
 * published work and claims to be nobody's. Replace it through /admin, then
 * this file can be deleted.
 * ─────────────────────────────────────────────────────────────────────────
 */
const SEED: Array<{
  name: string;
  slug: string;
  sortOrder: number;
  kalam: Array<{ title: string; lyrics: string; isFeatured?: boolean }>;
}> = [
  {
    name: "حمد",
    slug: "hamd",
    sortOrder: 1,
    kalam: [
      {
        title: "نمونہ حمد ۔ اول",
        lyrics: `یہ پہلی سطر نمونے کے طور پر لکھی گئی ہے
دوسری سطر بھی اسی نمونے کا حصہ ہے

یہ نیا بند ہے، خالی سطر سے الگ ہوا
اور یہ اس بند کی دوسری سطر ہے`,
      },
      {
        title: "نمونہ حمد ۔ دوم",
        lyrics: `نمونے کا متن یہاں درج ہے
تاکہ صفحے کی ترتیب جانچی جا سکے

اصل کلام انتظامیہ کے صفحے سے شامل کریں
یہ سطریں محض جگہ بھرنے کے لیے ہیں`,
      },
    ],
  },
  {
    name: "نعت",
    slug: "naat",
    sortOrder: 2,
    kalam: [
      {
        title: "نمونہ نعت ۔ اول",
        lyrics: `یہ سطر صرف نمونے کے لیے ہے
اس کا کوئی ادبی دعویٰ نہیں

دوسرا بند یہاں سے شروع ہوتا ہے
اور یہاں ختم ہو جاتا ہے`,
        isFeatured: true,
      },
      {
        title: "نمونہ نعت ۔ دوم",
        lyrics: `نمونہ متن، پہلی سطر
نمونہ متن، دوسری سطر

نمونہ متن، تیسری سطر
نمونہ متن، چوتھی سطر`,
      },
      {
        title: "نمونہ نعت ۔ سوم",
        lyrics: `طویل کلام کی جانچ کے لیے یہ متن رکھا گیا ہے
تاکہ پڑھنے کی پٹی اور حروف کا حجم دیکھا جا سکے

یہ دوسرا بند ہے
اس میں بھی دو سطریں ہیں

یہ تیسرا بند ہے
اور یہ اس کی آخری سطر ہے`,
      },
    ],
  },
  {
    name: "منقبت",
    slug: "manqabat",
    sortOrder: 3,
    kalam: [
      {
        title: "نمونہ منقبت ۔ اول",
        lyrics: `نمونے کی پہلی سطر یہاں ہے
نمونے کی دوسری سطر یہاں ہے

نیا بند، پہلی سطر
نیا بند، دوسری سطر`,
      },
      {
        title: "نمونہ منقبت ۔ دوم",
        lyrics: `یہ متن عارضی ہے
اسے انتظامیہ سے بدل دیں

دوسرا بند یہاں ہے
اس کی دوسری سطر یہاں ہے`,
      },
    ],
  },
  {
    name: "سلام",
    slug: "salaam",
    sortOrder: 4,
    kalam: [
      {
        title: "نمونہ سلام ۔ اول",
        lyrics: `پہلی سطر برائے نمونہ
دوسری سطر برائے نمونہ

تیسری سطر نئے بند میں
چوتھی سطر نئے بند میں`,
      },
      {
        title: "نمونہ سلام ۔ دوم",
        lyrics: `یہ عارضی متن ہے
جو صرف ترتیب جانچنے کو ہے

اصل کلام بعد میں شامل ہوگا
یہ سطریں حذف کر دی جائیں گی`,
      },
    ],
  },
  {
    name: "مناجات",
    slug: "munajaat",
    sortOrder: 5,
    kalam: [
      {
        title: "نمونہ مناجات ۔ اول",
        lyrics: `نمونہ سطر ایک
نمونہ سطر دو

نمونہ سطر تین
نمونہ سطر چار`,
      },
      {
        title: "نمونہ مناجات ۔ دوم",
        lyrics: `یہ متن جانچ کے لیے ہے
اور کسی کا کلام نہیں

دوسرا بند یہاں سے
یہاں تک`,
      },
    ],
  },
  {
    name: "متفرقات",
    slug: "mutafarriqaat",
    sortOrder: 6,
    kalam: [
      {
        title: "نمونہ متفرقات ۔ اول",
        lyrics: `پہلی نمونہ سطر
دوسری نمونہ سطر

تیسری نمونہ سطر
چوتھی نمونہ سطر`,
      },
      {
        title: "نمونہ متفرقات ۔ دوم",
        lyrics: `عارضی متن، سطر اول
عارضی متن، سطر دوم

عارضی متن، سطر سوم
عارضی متن، سطر چہارم`,
      },
    ],
  },
];

async function main() {
  const url = process.env.DATABASE_URL_ADMIN ?? process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      "DATABASE_URL_ADMIN is not set. Add it to .env.local before seeding.",
    );
  }

  const db = drizzle(neon(url), { schema: { categories, kalam } });

  let categoryCount = 0;
  let kalamCount = 0;

  for (const entry of SEED) {
    // Re-running the seed refreshes the display name and ordering but never
    // duplicates a category, so it is safe to run against a live database.
    const [row] = await db
      .insert(categories)
      .values({
        name: entry.name,
        slug: entry.slug,
        sortOrder: entry.sortOrder,
      })
      .onConflictDoUpdate({
        target: categories.slug,
        set: { name: entry.name, sortOrder: entry.sortOrder },
      })
      .returning({ id: categories.id });

    categoryCount++;

    for (const poem of entry.kalam) {
      const inserted = await db
        .insert(kalam)
        .values({
          title: poem.title,
          lyrics: poem.lyrics,
          categoryId: row.id,
          slug: slugify(poem.title),
          isFeatured: poem.isFeatured ?? false,
        })
        // Existing kalam are left untouched — an editor's changes always win
        // over the seed.
        .onConflictDoNothing({ target: kalam.slug })
        .returning({ id: kalam.id });

      if (inserted.length > 0) kalamCount++;
    }
  }

  console.log(
    `✓ seeded ${categoryCount} categories, inserted ${kalamCount} new kalam`,
  );
}

main().catch((error) => {
  console.error("✗ seed failed:", error);
  process.exit(1);
});
