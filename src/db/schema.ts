import { relations } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

export const categories = pgTable(
  "categories",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    /** Urdu display text, e.g. "نعت". */
    name: text("name").notNull(),
    /** URL segment. Powers the public /[category] route with zero code changes. */
    slug: text("slug").notNull().unique(),
    /**
     * Optional override for the generative cover art. When null the gradient
     * is derived deterministically from `slug` instead — see lib/gradient.ts.
     */
    coverGradientSeed: text("cover_gradient_seed"),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [index("categories_sort_order_idx").on(t.sortOrder)],
);

export const kalam = pgTable(
  "kalam",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    title: text("title").notNull(),
    lyrics: text("lyrics").notNull(),
    // No per-kalam author column by design: this diwan is the work of a
    // single poet, so attribution belongs to the collection (see lib/site.ts)
    // rather than being repeated — and made contradictable — on every row.
    categoryId: uuid("category_id")
      .notNull()
      .references(() => categories.id, { onDelete: "cascade" }),
    slug: text("slug").notNull().unique(),
    /** Powers the homepage "کلامِ روز" panel. */
    isFeatured: boolean("is_featured").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    index("kalam_category_id_idx").on(t.categoryId),
    index("kalam_is_featured_idx").on(t.isFeatured),
  ],
);

export const categoriesRelations = relations(categories, ({ many }) => ({
  kalam: many(kalam),
}));

export const kalamRelations = relations(kalam, ({ one }) => ({
  category: one(categories, {
    fields: [kalam.categoryId],
    references: [categories.id],
  }),
}));

export type Category = typeof categories.$inferSelect;
export type NewCategory = typeof categories.$inferInsert;
export type Kalam = typeof kalam.$inferSelect;
export type NewKalam = typeof kalam.$inferInsert;

/** A kalam joined with the display fields of its category. */
export type KalamWithCategory = Kalam & {
  categoryName: string;
  categorySlug: string;
};
