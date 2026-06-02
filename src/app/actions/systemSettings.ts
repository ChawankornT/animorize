"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod/v4";
import { createClient } from "@/lib/supabase/server";
import { createSystemSettingsRepository } from "@/repositories";
import { updateSystemSettings } from "@/domain/usecases/UpdateSystemSettings";

export type SystemSettingsState = {
  message?: string;
  success?: boolean;
};

const settingsSchema = z.object({
  autoSyncEnabled: z.coerce.boolean(),
});

export async function updateSystemSettingsAction(
  _prev: SystemSettingsState,
  formData: FormData,
): Promise<SystemSettingsState> {
  const parsed = settingsSchema.safeParse({
    autoSyncEnabled: formData.get("autoSyncEnabled"),
  });

  if (!parsed.success) {
    return { message: "Invalid settings." };
  }

  try {
    const supabase = await createClient();
    const repo = createSystemSettingsRepository(supabase);
    await updateSystemSettings(repo, { autoSyncEnabled: parsed.data.autoSyncEnabled });
    revalidatePath("/admin/settings");
    return { success: true, message: "Settings saved." };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed to save settings";
    return { message: msg };
  }
}
