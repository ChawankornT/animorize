"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { z } from "zod/v4";
import { createClient } from "@/lib/supabase/server";
import { createFranchiseRepository } from "@/repositories";
import { createFranchise } from "@/domain/usecases/CreateFranchise";
import { updateFranchise } from "@/domain/usecases/UpdateFranchise";
import { deleteFranchise } from "@/domain/usecases/DeleteFranchise";

export type FranchiseActionState = {
  message?: string;
  rootError?: string;
  errors?: {
    titleTh?: string[];
    titleEn?: string[];
    titleRomaji?: string[];
    posterUrl?: string[];
    synopsis?: string[];
  };
};

export type DeleteActionState = {
  error?: string;
};

function isValidUrl(v: string): boolean {
  try {
    new URL(v);
    return true;
  } catch {
    return false;
  }
}

const franchiseSchema = z
  .object({
    titleTh: z.string(),
    titleEn: z.string(),
    titleRomaji: z.string(),
    posterUrl: z.string().refine(v => v === "" || isValidUrl(v), "Must be a valid URL"),
    synopsis: z.string(),
  })
  .refine(data => data.titleTh || data.titleEn || data.titleRomaji, {
    message: "At least one title is required",
  });

const updateFranchiseSchema = franchiseSchema.extend({ id: z.string().min(1) });

function parseResult(error: z.ZodError): Pick<FranchiseActionState, "rootError" | "errors"> {
  const fieldErrors: Record<string, string[]> = {};
  let rootError: string | undefined;
  for (const issue of error.issues) {
    if (issue.path.length === 0) {
      rootError = issue.message;
    } else {
      const key = String(issue.path[0]);
      if (!fieldErrors[key]) fieldErrors[key] = [];
      fieldErrors[key].push(issue.message);
    }
  }
  return { rootError, errors: fieldErrors as FranchiseActionState["errors"] };
}

export async function createFranchiseAction(
  _prev: FranchiseActionState,
  formData: FormData,
): Promise<FranchiseActionState> {
  const parsed = franchiseSchema.safeParse({
    titleTh: formData.get("titleTh") ?? "",
    titleEn: formData.get("titleEn") ?? "",
    titleRomaji: formData.get("titleRomaji") ?? "",
    posterUrl: formData.get("posterUrl") ?? "",
    synopsis: formData.get("synopsis") ?? "",
  });

  if (!parsed.success) {
    return parseResult(parsed.error);
  }

  try {
    const supabase = await createClient();
    const repo = createFranchiseRepository(supabase);
    await createFranchise(repo, {
      titleTh: parsed.data.titleTh || null,
      titleEn: parsed.data.titleEn || null,
      titleRomaji: parsed.data.titleRomaji || null,
      posterUrl: parsed.data.posterUrl || null,
      synopsis: parsed.data.synopsis || null,
    });
    revalidatePath("/admin/franchises");
    redirect("/admin/franchises");
  } catch (err) {
    if (isRedirectError(err)) throw err;
    const msg = err instanceof Error ? err.message : "Failed to create franchise";
    return { message: msg };
  }
}

export async function updateFranchiseAction(
  _prev: FranchiseActionState,
  formData: FormData,
): Promise<FranchiseActionState> {
  const parsed = updateFranchiseSchema.safeParse({
    id: formData.get("id") ?? "",
    titleTh: formData.get("titleTh") ?? "",
    titleEn: formData.get("titleEn") ?? "",
    titleRomaji: formData.get("titleRomaji") ?? "",
    posterUrl: formData.get("posterUrl") ?? "",
    synopsis: formData.get("synopsis") ?? "",
  });

  if (!parsed.success) {
    return parseResult(parsed.error);
  }

  try {
    const supabase = await createClient();
    const repo = createFranchiseRepository(supabase);
    await updateFranchise(repo, parsed.data.id, {
      titleTh: parsed.data.titleTh || null,
      titleEn: parsed.data.titleEn || null,
      titleRomaji: parsed.data.titleRomaji || null,
      posterUrl: parsed.data.posterUrl || null,
      synopsis: parsed.data.synopsis || null,
    });
    revalidatePath("/admin/franchises");
    redirect("/admin/franchises");
  } catch (err) {
    if (isRedirectError(err)) throw err;
    const msg = err instanceof Error ? err.message : "Failed to update franchise";
    return { message: msg };
  }
}

// Required second param: Next.js server action bind() pattern — FormData is passed but not needed
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function deleteFranchiseAction(id: string, _: FormData): Promise<DeleteActionState> {
  try {
    const supabase = await createClient();
    const repo = createFranchiseRepository(supabase);
    await deleteFranchise(repo, id);
    revalidatePath("/admin/franchises");
    redirect("/admin/franchises");
  } catch (err) {
    if (isRedirectError(err)) throw err;
    const msg = err instanceof Error ? err.message : "";
    if (msg.includes("foreign key") || msg.includes("violates")) {
      return { error: "Cannot delete: this franchise has media entries" };
    }
    return { error: "Failed to delete franchise" };
  }
}
