"use server";

import { and, eq, ne } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { getAdminDb } from "@/db/admin";
import { categories, kalam } from "@/db/schema";
import {
  checkAdminPassword,
  clearLoginAttempts,
  endAdminSession,
  isAdminAuthenticated,
  registerLoginAttempt,
  startAdminSession,
} from "@/lib/auth";
import { uniqueSlug } from "@/lib/slugify";

import type { ActionState } from "./action-state";

function field(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

/**
 * Third gate. The proxy redirects browsers and the layout blocks rendering,
 * but a server action is an RPC endpoint that can be invoked directly — so it
 * verifies the session itself rather than trusting either of them.
 */
async function requireAdmin(): Promise<void> {
  if (!(await isAdminAuthenticated())) redirect("/admin/login");
}

/** Turns an unexpected DB failure into something an admin can act on. */
function failure(error: unknown): ActionState {
  console.error("[admin action]", error);
  const message =
    error instanceof Error && error.message.includes("DATABASE_URL_ADMIN")
      ? "Database connection is not configured — set DATABASE_URL_ADMIN."
      : "Something went wrong while saving. Please try again.";
  return { status: "error", message };
}

/** Everything the public site renders comes from this data. */
function revalidatePublic(): void {
  revalidatePath("/", "layout");
}

// ── Auth ──────────────────────────────────────────────────────────────

export async function loginAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const password = field(formData, "password");
  const next = field(formData, "next");

  if (!password) {
    return {
      status: "error",
      message: "Password is required.",
      fieldErrors: { password: "Password is required." },
    };
  }

  const requestHeaders = await headers();
  const key =
    requestHeaders.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";

  if (!registerLoginAttempt(key)) {
    return {
      status: "error",
      message: "Too many attempts. Please try again later.",
    };
  }

  // One message for every failure mode. A wrong password and an unset
  // ADMIN_PASSWORD must be indistinguishable from outside (§7); the real
  // cause is logged server-side by checkAdminPassword.
  const genericFailure: ActionState = {
    status: "error",
    message: "Could not sign in. Check the details and try again.",
  };

  if (!checkAdminPassword(password)) return genericFailure;
  if (!(await startAdminSession())) {
    console.error("[auth] SESSION_SECRET is missing or too short.");
    return genericFailure;
  }

  clearLoginAttempts(key);

  // Only same-origin absolute paths, so `?next=` cannot become an open redirect.
  redirect(next.startsWith("/admin") ? next : "/admin");
}

export async function logoutAction(): Promise<void> {
  await endAdminSession();
  redirect("/admin/login");
}

// ── Categories ────────────────────────────────────────────────────────

export async function createCategoryAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();

  const name = field(formData, "name");
  const rawSlug = field(formData, "slug");
  const sortOrder = Number.parseInt(field(formData, "sortOrder"), 10);

  if (!name) {
    return {
      status: "error",
      message: "Topic name is required.",
      fieldErrors: { name: "Name is required." },
    };
  }

  try {
    const db = getAdminDb();

    const slug = await uniqueSlug(rawSlug || name, async (candidate) => {
      const [existing] = await db
        .select({ id: categories.id })
        .from(categories)
        .where(eq(categories.slug, candidate))
        .limit(1);
      return Boolean(existing);
    });

    await db.insert(categories).values({
      name,
      slug,
      sortOrder: Number.isFinite(sortOrder) ? sortOrder : 0,
    });

    revalidatePublic();
    return {
      status: "success",
      message: `“${name}” created — its page is live at /${slug}.`,
    };
  } catch (error) {
    return failure(error);
  }
}

export async function updateCategoryAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();

  const id = field(formData, "id");
  const name = field(formData, "name");
  const rawSlug = field(formData, "slug");
  const sortOrder = Number.parseInt(field(formData, "sortOrder"), 10);

  if (!id) return { status: "error", message: "Topic id missing." };
  if (!name) {
    return {
      status: "error",
      message: "Topic name is required.",
      fieldErrors: { name: "Name is required." },
    };
  }

  try {
    const db = getAdminDb();

    const slug = await uniqueSlug(rawSlug || name, async (candidate) => {
      const [existing] = await db
        .select({ id: categories.id })
        .from(categories)
        // Its own current slug must not count as taken.
        .where(and(eq(categories.slug, candidate), ne(categories.id, id)))
        .limit(1);
      return Boolean(existing);
    });

    await db
      .update(categories)
      .set({
        name,
        slug,
        sortOrder: Number.isFinite(sortOrder) ? sortOrder : 0,
      })
      .where(eq(categories.id, id));

    revalidatePublic();
    return { status: "success", message: `“${name}” saved.` };
  } catch (error) {
    return failure(error);
  }
}

export async function deleteCategoryAction(formData: FormData): Promise<void> {
  await requireAdmin();

  const id = field(formData, "id");
  if (!id) return;

  // The FK is ON DELETE CASCADE, so this removes every kalam in the category.
  // The confirmation dialog in the UI states that explicitly.
  const db = getAdminDb();
  await db.delete(categories).where(eq(categories.id, id));

  revalidatePublic();
  redirect("/admin/categories?flash=category-deleted");
}

// ── Kalam ─────────────────────────────────────────────────────────────

type KalamInput = {
  title: string;
  lyrics: string;
  categoryId: string;
  isFeatured: boolean;
};

function readKalamInput(formData: FormData):
  | { ok: true; value: KalamInput }
  | { ok: false; state: ActionState } {
  const title = field(formData, "title");
  const lyrics = field(formData, "lyrics");
  const categoryId = field(formData, "categoryId");

  const fieldErrors: Record<string, string> = {};
  if (!title) fieldErrors.title = "Title is required.";
  if (!lyrics) fieldErrors.lyrics = "Kalam text is required.";
  if (!categoryId) fieldErrors.categoryId = "Choose a topic.";

  if (Object.keys(fieldErrors).length > 0) {
    return {
      ok: false,
      state: {
        status: "error",
        message: "Some fields are incomplete.",
        fieldErrors,
      },
    };
  }

  return {
    ok: true,
    value: {
      title,
      lyrics,
      categoryId,
      isFeatured: formData.get("isFeatured") === "on",
    },
  };
}

export async function createKalamAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();

  const parsed = readKalamInput(formData);
  if (!parsed.ok) return parsed.state;

  let newId: string;

  try {
    const db = getAdminDb();

    const slug = await uniqueSlug(
      field(formData, "slug") || parsed.value.title,
      async (candidate) => {
        const [existing] = await db
          .select({ id: kalam.id })
          .from(kalam)
          .where(eq(kalam.slug, candidate))
          .limit(1);
        return Boolean(existing);
      },
    );

    const [row] = await db
      .insert(kalam)
      .values({ ...parsed.value, slug })
      .returning({ id: kalam.id });

    newId = row.id;
    revalidatePublic();
  } catch (error) {
    return failure(error);
  }

  // redirect() throws, so it must sit outside the try — otherwise the catch
  // would swallow the control-flow signal and report a phantom failure.
  redirect(`/admin/kalam/${newId}/edit?flash=created`);
}

export async function updateKalamAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();

  const id = field(formData, "id");
  if (!id) return { status: "error", message: "Kalam id missing." };

  const parsed = readKalamInput(formData);
  if (!parsed.ok) return parsed.state;

  try {
    const db = getAdminDb();

    const slug = await uniqueSlug(
      field(formData, "slug") || parsed.value.title,
      async (candidate) => {
        const [existing] = await db
          .select({ id: kalam.id })
          .from(kalam)
          .where(and(eq(kalam.slug, candidate), ne(kalam.id, id)))
          .limit(1);
        return Boolean(existing);
      },
    );

    await db
      .update(kalam)
      .set({ ...parsed.value, slug })
      .where(eq(kalam.id, id));

    revalidatePublic();
    return {
      status: "success",
      message: `“${parsed.value.title}” saved.`,
    };
  } catch (error) {
    return failure(error);
  }
}

export async function deleteKalamAction(formData: FormData): Promise<void> {
  await requireAdmin();

  const id = field(formData, "id");
  if (!id) return;

  const db = getAdminDb();
  await db.delete(kalam).where(eq(kalam.id, id));

  revalidatePublic();
  redirect("/admin/kalam?flash=kalam-deleted");
}

/** Used by the list view's inline star toggle. */
export async function toggleFeaturedAction(formData: FormData): Promise<void> {
  await requireAdmin();

  const id = field(formData, "id");
  if (!id) return;

  const db = getAdminDb();
  const [row] = await db
    .select({ isFeatured: kalam.isFeatured })
    .from(kalam)
    .where(eq(kalam.id, id))
    .limit(1);

  if (!row) return;

  await db
    .update(kalam)
    .set({ isFeatured: !row.isFeatured })
    .where(eq(kalam.id, id));

  revalidatePublic();
  revalidatePath("/admin/kalam");
}
