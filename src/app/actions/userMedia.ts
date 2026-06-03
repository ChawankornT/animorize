"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  createUserMediaRepository,
  createMediaRepository,
  createMediaProviderRepository,
  createProviderRepository,
} from "@/repositories";
import { setFavorite } from "@/domain/usecases/SetFavorite";
import { removeFromLibrary } from "@/domain/usecases/RemoveFromLibrary";
import { addToLibrary, DuplicateLibraryEntryError } from "@/domain/usecases/AddToLibrary";
import { listMedia } from "@/domain/usecases/ListMedia";
import { listMediaProviders } from "@/domain/usecases/ListMediaProviders";
import { listProviders } from "@/domain/usecases/ListProviders";
import { updateLibraryProvider } from "@/domain/usecases/UpdateLibraryProvider";
import type { Media } from "@/domain/entities/Media";
import type { MediaProvider } from "@/domain/entities/MediaProvider";
import type { Provider } from "@/domain/entities/Provider";

export type UserMediaActionResult =
  | { success: true; message: string }
  | { success: false; message: string; reason: "duplicate" | "unauthorized" | "invalid" | "error" };

export async function toggleFavoriteAction(
  userMediaId: string,
  next: boolean,
): Promise<UserMediaActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, message: "Unauthorized", reason: "unauthorized" };

  try {
    const repo = createUserMediaRepository(supabase);
    await setFavorite(repo, userMediaId, next);
    revalidatePath("/dashboard");
    return { success: true, message: next ? "Added to favorites" : "Removed from favorites" };
  } catch (error) {
    console.error("[toggleFavoriteAction]", error);
    return { success: false, message: "Failed to update favorite", reason: "error" };
  }
}

export async function removeFromLibraryAction(userMediaId: string): Promise<UserMediaActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, message: "Unauthorized", reason: "unauthorized" };

  try {
    const repo = createUserMediaRepository(supabase);
    await removeFromLibrary(repo, userMediaId);
    revalidatePath("/dashboard");
    return { success: true, message: "Removed from library" };
  } catch (error) {
    console.error("[removeFromLibraryAction]", error);
    return { success: false, message: "Failed to remove from library", reason: "error" };
  }
}

export async function searchMediaAction(query: string): Promise<Media[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const repo = createMediaRepository(supabase);
  return listMedia(repo, { search: query });
}

export async function getAddToLibraryDataAction(mediaId: string): Promise<{
  allProviders: Provider[];
  mediaProviders: MediaProvider[];
}> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { allProviders: [], mediaProviders: [] };

  const [allProviders, mediaProviders] = await Promise.all([
    listProviders(createProviderRepository(supabase)),
    listMediaProviders(createMediaProviderRepository(supabase), mediaId),
  ]);

  return { allProviders, mediaProviders };
}

const addToLibrarySchema = z.object({
  mediaId: z.string().uuid(),
  providerId: z.string().uuid().nullable().optional(),
  audio: z.enum(["sub", "dub"]).optional(),
  customUrl: z.string().url().nullable().optional(),
});

export async function addToLibraryAction(
  input: z.infer<typeof addToLibrarySchema>,
): Promise<UserMediaActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, message: "Unauthorized", reason: "unauthorized" };

  const parsed = addToLibrarySchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, message: "Invalid input", reason: "invalid" };
  }

  try {
    const repo = createUserMediaRepository(supabase);
    await addToLibrary(repo, { userId: user.id, ...parsed.data });
    revalidatePath("/dashboard");
    return { success: true, message: "Added to library" };
  } catch (error) {
    console.error("[addToLibraryAction]", error);
    if (error instanceof DuplicateLibraryEntryError) {
      return { success: false, message: "Already in your library.", reason: "duplicate" };
    }
    return { success: false, message: "Failed to add to library", reason: "error" };
  }
}

const changeLibraryProviderSchema = z.object({
  providerId: z.string().uuid().nullable(),
  audio: z.enum(["sub", "dub"]),
  customUrl: z.string().url().nullable().optional(),
});

export async function changeLibraryProviderAction(
  userMediaId: string,
  input: z.infer<typeof changeLibraryProviderSchema>,
): Promise<UserMediaActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, message: "Unauthorized", reason: "unauthorized" };

  const parsed = changeLibraryProviderSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, message: "Invalid input", reason: "invalid" };
  }

  try {
    const repo = createUserMediaRepository(supabase);
    await updateLibraryProvider(repo, userMediaId, {
      providerId: parsed.data.providerId,
      audio: parsed.data.audio,
      customUrl: parsed.data.customUrl ?? null,
    });
    revalidatePath("/dashboard");
    return { success: true, message: "Provider updated" };
  } catch (error) {
    console.error("[changeLibraryProviderAction]", error);
    return { success: false, message: "Failed to update provider", reason: "error" };
  }
}
