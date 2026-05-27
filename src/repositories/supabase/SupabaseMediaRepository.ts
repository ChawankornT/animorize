import type { SupabaseDb } from '@/lib/supabase/types';
import type { IMediaRepository } from '@/repositories/interfaces/IMediaRepository';
import type { Media, CreateMediaInput, UpdateMediaInput, MediaType, AiringStatus } from '@/domain/entities/Media';
import {
  toMedia,
  fromCreateMediaInput,
  fromUpdateMediaInput,
} from '@/repositories/supabase/mappers';

export class SupabaseMediaRepository implements IMediaRepository {
  constructor(private readonly supabase: SupabaseDb) {}

  async findAll(options?: {
    franchiseId?: string;
    mediaType?: MediaType;
    airingStatus?: AiringStatus;
  }): Promise<Media[]> {
    let query = this.supabase
      .from('media')
      .select('*')
      .order('sort_order');

    if (options?.franchiseId) query = query.eq('franchise_id', options.franchiseId);
    if (options?.mediaType) query = query.eq('media_type', options.mediaType);
    if (options?.airingStatus) query = query.eq('airing_status', options.airingStatus);

    const { data, error } = await query;
    if (error) throw new Error(`Failed to list media: ${error.message}`);
    return (data ?? []).map(toMedia);
  }

  async findById(id: string): Promise<Media | null> {
    const { data, error } = await this.supabase
      .from('media')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error(`Failed to find media: ${error.message}`);
    }
    return toMedia(data);
  }

  async findByAnilistId(anilistId: number): Promise<Media | null> {
    const { data, error } = await this.supabase
      .from('media')
      .select('*')
      .eq('anilist_id', anilistId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error(`Failed to find media by AniList ID: ${error.message}`);
    }
    return toMedia(data);
  }

  async create(input: CreateMediaInput): Promise<Media> {
    const { data, error } = await this.supabase
      .from('media')
      .insert(fromCreateMediaInput(input))
      .select()
      .single();

    if (error) throw new Error(`Failed to create media: ${error.message}`);
    return toMedia(data);
  }

  async update(id: string, input: UpdateMediaInput): Promise<Media> {
    const { data, error } = await this.supabase
      .from('media')
      .update(fromUpdateMediaInput(input))
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') throw new Error(`Media not found: ${id}`);
      throw new Error(`Failed to update media: ${error.message}`);
    }
    return toMedia(data);
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('media')
      .delete()
      .eq('id', id);

    if (error) throw new Error(`Failed to delete media: ${error.message}`);
  }
}
