"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod/v4";
import { createClient } from "@/lib/supabase/server";
import { createMediaProviderRepository } from "@/repositories";
import { assignProvider } from "@/domain/usecases/AssignProvider";
import { removeProvider } from "@/domain/usecases/RemoveProvider";

export type AssignProviderState = {
  message?: string;
  success?: boolean;
  errors?: {
    providerId?: string[];
    audio?: string[];
    baseUrl?: string[];
  };
};

export type RemoveProviderState = {
  error?: string;
};

const assignSchema = z.object({
  mediaId: z.string().uuid(),
  providerId: z.string().uuid(),
  audio: z.enum(["sub", "dub"]),
  baseUrl: z.string().url().optional().or(z.literal("")),
});

export async function assignProviderAction(
  _prev: AssignProviderState,
  formData: FormData,
): Promise<AssignProviderState> {
  const parsed = assignSchema.safeParse({
    mediaId: formData.get("mediaId"),
    providerId: formData.get("providerId"),
    audio: formData.get("audio"),
    baseUrl: formData.get("baseUrl") ?? "",
  });

  if (!parsed.success) {
    const fieldErrors: AssignProviderState["errors"] = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0]);
      if (key === "providerId") (fieldErrors.providerId ??= []).push(issue.message);
      else if (key === "audio") (fieldErrors.audio ??= []).push(issue.message);
      else if (key === "baseUrl") (fieldErrors.baseUrl ??= []).push(issue.message);
    }
    return { errors: fieldErrors };
  }

  const { mediaId, providerId, audio, baseUrl } = parsed.data;

  try {
    const supabase = await createClient();
    const repo = createMediaProviderRepository(supabase);
    await assignProvider(repo, {
      mediaId,
      providerId,
      audio,
      baseUrl: baseUrl || null,
    });
    revalidatePath(`/admin/media/${mediaId}`);
    return { message: "Provider assigned.", success: true };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed to assign provider";
    if (msg.includes("unique") || msg.includes("duplicate") || msg.includes("violates")) {
      return { message: "This provider + audio combination is already assigned." };
    }
    return { message: msg };
  }
}

export async function removeProviderAction(
  id: string,
  _prev: RemoveProviderState,
  formData: FormData,
): Promise<RemoveProviderState> {
  const mediaId = formData.get("mediaId") as string;

  try {
    const supabase = await createClient();
    const repo = createMediaProviderRepository(supabase);
    await removeProvider(repo, id);
    revalidatePath(`/admin/media/${mediaId}`);
    return {};
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed to remove provider";
    return { error: msg };
  }
}
