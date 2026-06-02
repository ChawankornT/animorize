import type { SupabaseDb } from "@/lib/supabase/types";
import type { IMediaProviderRepository } from "@/repositories/interfaces/IMediaProviderRepository";
import type { MediaProvider, CreateMediaProviderInput } from "@/domain/entities/MediaProvider";
import { toMediaProvider, fromCreateMediaProviderInput } from "@/repositories/supabase/mappers";

export class SupabaseMediaProviderRepository implements IMediaProviderRepository {
  constructor(private readonly supabase: SupabaseDb) {}

  async findByMediaId(mediaId: string): Promise<MediaProvider[]> {
    const { data, error } = await this.supabase
      .from("media_providers")
      .select("*, providers(name, color)")
      .eq("media_id", mediaId)
      .order("created_at", { ascending: true });

    if (error) throw new Error(`Failed to list media providers: ${error.message}`);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (data ?? []).map(row => toMediaProvider(row as any));
  }

  async create(input: CreateMediaProviderInput): Promise<MediaProvider> {
    const { data, error } = await this.supabase
      .from("media_providers")
      .insert(fromCreateMediaProviderInput(input))
      .select("*, providers(name, color)")
      .single();

    if (error) throw new Error(`Failed to assign provider: ${error.message}`);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return toMediaProvider(data as any);
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.supabase.from("media_providers").delete().eq("id", id);

    if (error) throw new Error(`Failed to remove provider: ${error.message}`);
  }
}
