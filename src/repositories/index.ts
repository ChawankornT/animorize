import type { SupabaseDb } from "@/lib/supabase/types";
import { SupabaseProviderRepository } from "@/repositories/supabase/SupabaseProviderRepository";
import { SupabaseFranchiseRepository } from "@/repositories/supabase/SupabaseFranchiseRepository";
import { SupabaseMediaRepository } from "@/repositories/supabase/SupabaseMediaRepository";
import { SupabaseMediaProviderRepository } from "@/repositories/supabase/SupabaseMediaProviderRepository";
import { SupabaseSyncLogRepository } from "@/repositories/supabase/SupabaseSyncLogRepository";
import { SupabaseSystemSettingsRepository } from "@/repositories/supabase/SupabaseSystemSettingsRepository";
import { SupabaseUserMediaRepository } from "@/repositories/supabase/SupabaseUserMediaRepository";
import { SupabaseWatchLogRepository } from "@/repositories/supabase/SupabaseWatchLogRepository";

export function createProviderRepository(supabase: SupabaseDb) {
  return new SupabaseProviderRepository(supabase);
}

export function createFranchiseRepository(supabase: SupabaseDb) {
  return new SupabaseFranchiseRepository(supabase);
}

export function createMediaRepository(supabase: SupabaseDb) {
  return new SupabaseMediaRepository(supabase);
}

export function createMediaProviderRepository(supabase: SupabaseDb) {
  return new SupabaseMediaProviderRepository(supabase);
}

export function createSyncLogRepository(supabase: SupabaseDb) {
  return new SupabaseSyncLogRepository(supabase);
}

export function createSystemSettingsRepository(supabase: SupabaseDb) {
  return new SupabaseSystemSettingsRepository(supabase);
}

export function createUserMediaRepository(supabase: SupabaseDb) {
  return new SupabaseUserMediaRepository(supabase);
}

export function createWatchLogRepository(supabase: SupabaseDb) {
  return new SupabaseWatchLogRepository(supabase);
}
