import { SupabaseError } from "@/lib/supabase/errors";
import type { SupabaseDb } from "@/lib/supabase/types";
import type {
  IUserMediaRepository,
  UpdateProviderInput,
  IncrementEpisodeResult,
} from "@/repositories/interfaces/IUserMediaRepository";
import type {
  UserMedia,
  UserMediaWithMedia,
  AddToLibraryInput,
  WatchStatus,
} from "@/domain/entities/UserMedia";
import {
  toUserMedia,
  toUserMediaWithMedia,
  fromAddToLibraryInput,
  type UserMediaRowWithJoin,
} from "@/repositories/supabase/mappers";

const USER_MEDIA_WITH_MEDIA_SELECT =
  "*, media(title_th, title_en, title_romaji, poster_url, total_episodes, media_type, media_providers(provider_id, audio, base_url)), providers(name, color)" as const;

export class SupabaseUserMediaRepository implements IUserMediaRepository {
  constructor(private readonly supabase: SupabaseDb) {}

  async add(input: AddToLibraryInput): Promise<UserMedia> {
    const { data, error } = await this.supabase
      .from("user_media")
      .insert(fromAddToLibraryInput(input))
      .select()
      .single();

    if (error)
      throw new SupabaseError(`Failed to add media to library: ${error.message}`, error.code);
    return toUserMedia(data);
  }

  async findByUserId(userId: string): Promise<UserMediaWithMedia[]> {
    const { data, error } = await this.supabase
      .from("user_media")
      .select(USER_MEDIA_WITH_MEDIA_SELECT)
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw new Error(`Failed to list user library: ${error.message}`);
    return (data ?? []).map(row => toUserMediaWithMedia(row as unknown as UserMediaRowWithJoin));
  }

  async findMediaIdsByUserId(userId: string): Promise<string[]> {
    const { data, error } = await this.supabase
      .from("user_media")
      .select("media_id")
      .eq("user_id", userId);

    if (error) throw new Error(`Failed to list user media IDs: ${error.message}`);
    return (data ?? []).map(row => row.media_id);
  }

  async findByUserAndMedia(userId: string, mediaId: string): Promise<UserMedia | null> {
    const { data, error } = await this.supabase
      .from("user_media")
      .select()
      .eq("user_id", userId)
      .eq("media_id", mediaId)
      .single();

    if (error) {
      if (error.code === "PGRST116") return null;
      throw new Error(`Failed to find user media: ${error.message}`);
    }
    return toUserMedia(data);
  }

  async updateFavorite(id: string, isFavorite: boolean): Promise<UserMedia> {
    const { data, error } = await this.supabase
      .from("user_media")
      .update({ is_favorite: isFavorite })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      if (error.code === "PGRST116") throw new Error(`User media not found: ${id}`);
      throw new Error(`Failed to update favorite: ${error.message}`);
    }
    return toUserMedia(data);
  }

  async updateStatus(id: string, status: WatchStatus): Promise<UserMedia> {
    const { data, error } = await this.supabase
      .from("user_media")
      .update({ status })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      if (error.code === "PGRST116") throw new Error(`User media not found: ${id}`);
      throw new Error(`Failed to update status: ${error.message}`);
    }
    return toUserMedia(data);
  }

  async updateProvider(id: string, input: UpdateProviderInput): Promise<UserMedia> {
    const { data, error } = await this.supabase
      .from("user_media")
      .update({
        provider_id: input.providerId,
        audio: input.audio,
        custom_url: input.customUrl,
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      if (error.code === "PGRST116") throw new Error(`User media not found: ${id}`);
      throw new Error(`Failed to update provider: ${error.message}`);
    }
    return toUserMedia(data);
  }

  async remove(id: string): Promise<void> {
    const { data, error } = await this.supabase
      .from("user_media")
      .delete()
      .eq("id", id)
      .select("id");

    if (error) throw new Error(`Failed to remove from library: ${error.message}`);
    if (!data || data.length === 0) throw new Error(`User media not found: ${id}`);
  }

  async findWithMediaByUserAndMedia(
    userId: string,
    mediaId: string,
  ): Promise<UserMediaWithMedia | null> {
    const { data, error } = await this.supabase
      .from("user_media")
      .select(USER_MEDIA_WITH_MEDIA_SELECT)
      .eq("user_id", userId)
      .eq("media_id", mediaId)
      .maybeSingle();

    if (error) throw new Error(`Failed to find library item: ${error.message}`);
    if (!data) return null;
    return toUserMediaWithMedia(data as unknown as UserMediaRowWithJoin);
  }

  async incrementEpisode(
    userMediaId: string,
    fromEpisode: number,
  ): Promise<IncrementEpisodeResult> {
    const { data, error } = await this.supabase.rpc("increment_episode", {
      p_user_media_id: userMediaId,
      p_from_episode: fromEpisode,
    });

    if (error) throw new Error(`Failed to increment episode: ${error.message}`);
    if (data == null) return { status: "stale" };
    return { status: "updated", userMedia: toUserMedia(data) };
  }

  async startRewatch(userMediaId: string): Promise<UserMedia | null> {
    const { data: current, error: readError } = await this.supabase
      .from("user_media")
      .select("rewatch_count, status")
      .eq("id", userMediaId)
      .single();

    if (readError) throw new Error(`Failed to read user media: ${readError.message}`);
    if (!["completed", "dropped", "on_hold"].includes(current.status)) return null;

    const { data, error } = await this.supabase
      .from("user_media")
      .update({
        current_episode: 0,
        status: "watching" as WatchStatus,
        started_at: new Date().toISOString(),
        completed_at: null,
        rewatch_count: current.rewatch_count + 1,
      })
      .eq("id", userMediaId)
      .in("status", ["completed", "dropped", "on_hold"])
      .select()
      .single();

    if (error) {
      if (error.code === "PGRST116") return null;
      throw new Error(`Failed to start rewatch: ${error.message}`);
    }
    return toUserMedia(data);
  }

  async unmarkWatched(userMediaId: string): Promise<UserMedia> {
    const { data, error } = await this.supabase
      .from("user_media")
      .update({
        current_episode: 0,
        status: "plan_to_watch" as WatchStatus,
        started_at: null,
        completed_at: null,
      })
      .eq("id", userMediaId)
      .select()
      .single();

    if (error) {
      if (error.code === "PGRST116") throw new Error(`User media not found: ${userMediaId}`);
      throw new Error(`Failed to unmark watched: ${error.message}`);
    }
    return toUserMedia(data);
  }
}
