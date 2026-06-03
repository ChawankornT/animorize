export type UserRole = "user" | "admin";
export type MediaType = "anime" | "series" | "movie" | "ova" | "special";
export type WatchStatus = "watching" | "completed" | "on_hold" | "dropped" | "plan_to_watch";
export type AiringStatus = "ongoing" | "finished" | "upcoming";
export type AudioType = "sub" | "dub";
export type SyncResult = "success" | "failed";

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          display_name: string | null;
          avatar_url: string | null;
          role: UserRole;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          display_name?: string | null;
          avatar_url?: string | null;
          role?: UserRole;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          display_name?: string | null;
          avatar_url?: string | null;
          role?: UserRole;
          created_at?: string;
          updated_at?: string;
        };
      };
      franchises: {
        Row: {
          id: string;
          title_th: string | null;
          title_en: string | null;
          title_romaji: string | null;
          poster_url: string | null;
          synopsis: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title_th?: string | null;
          title_en?: string | null;
          title_romaji?: string | null;
          poster_url?: string | null;
          synopsis?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title_th?: string | null;
          title_en?: string | null;
          title_romaji?: string | null;
          poster_url?: string | null;
          synopsis?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      providers: {
        Row: {
          id: string;
          name: string;
          slug: string;
          color: string;
          logo_url: string | null;
          base_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          color: string;
          logo_url?: string | null;
          base_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          color?: string;
          logo_url?: string | null;
          base_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      media: {
        Row: {
          id: string;
          franchise_id: string | null;
          anilist_id: number | null;
          media_type: MediaType;
          title_th: string | null;
          title_en: string | null;
          title_romaji: string | null;
          synopsis: string | null;
          poster_url: string | null;
          genres: string[];
          total_episodes: number;
          season_quarter: number | null;
          season_year: number | null;
          air_date_start: string | null;
          air_date_end: string | null;
          airing_status: AiringStatus;
          auto_sync: boolean;
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          franchise_id?: string | null;
          anilist_id?: number | null;
          media_type: MediaType;
          title_th?: string | null;
          title_en?: string | null;
          title_romaji?: string | null;
          synopsis?: string | null;
          poster_url?: string | null;
          genres?: string[];
          total_episodes?: number;
          season_quarter?: number | null;
          season_year?: number | null;
          air_date_start?: string | null;
          air_date_end?: string | null;
          airing_status?: AiringStatus;
          auto_sync?: boolean;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          franchise_id?: string | null;
          anilist_id?: number | null;
          media_type?: MediaType;
          title_th?: string | null;
          title_en?: string | null;
          title_romaji?: string | null;
          synopsis?: string | null;
          poster_url?: string | null;
          genres?: string[];
          total_episodes?: number;
          season_quarter?: number | null;
          season_year?: number | null;
          air_date_start?: string | null;
          air_date_end?: string | null;
          airing_status?: AiringStatus;
          auto_sync?: boolean;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      media_providers: {
        Row: {
          id: string;
          media_id: string;
          provider_id: string;
          audio: AudioType;
          base_url: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          media_id: string;
          provider_id: string;
          audio?: AudioType;
          base_url?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          media_id?: string;
          provider_id?: string;
          audio?: AudioType;
          base_url?: string | null;
          created_at?: string;
        };
      };
      user_media: {
        Row: {
          id: string;
          user_id: string;
          media_id: string;
          provider_id: string | null;
          audio: AudioType;
          status: WatchStatus;
          current_episode: number;
          is_favorite: boolean;
          custom_url: string | null;
          started_at: string | null;
          completed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          media_id: string;
          provider_id?: string | null;
          audio?: AudioType;
          status?: WatchStatus;
          current_episode?: number;
          is_favorite?: boolean;
          custom_url?: string | null;
          started_at?: string | null;
          completed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          media_id?: string;
          provider_id?: string | null;
          audio?: AudioType;
          status?: WatchStatus;
          current_episode?: number;
          is_favorite?: boolean;
          custom_url?: string | null;
          started_at?: string | null;
          completed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      watchlogs: {
        Row: {
          id: string;
          user_id: string;
          media_id: string;
          episode_number: number;
          watched_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          media_id: string;
          episode_number: number;
          watched_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          media_id?: string;
          episode_number?: number;
          watched_at?: string;
        };
      };
      sync_logs: {
        Row: {
          id: string;
          media_id: string;
          result: SyncResult;
          error_message: string | null;
          synced_at: string;
        };
        Insert: {
          id?: string;
          media_id: string;
          result: SyncResult;
          error_message?: string | null;
          synced_at?: string;
        };
        Update: {
          id?: string;
          media_id?: string;
          result?: SyncResult;
          error_message?: string | null;
          synced_at?: string;
        };
      };
      system_settings: {
        Row: {
          id: number;
          auto_sync_enabled: boolean;
          updated_at: string;
        };
        Insert: {
          id?: number;
          auto_sync_enabled?: boolean;
          updated_at?: string;
        };
        Update: {
          id?: number;
          auto_sync_enabled?: boolean;
          updated_at?: string;
        };
      };
    };
    Enums: {
      user_role: UserRole;
      media_type: MediaType;
      watch_status: WatchStatus;
      airing_status: AiringStatus;
      audio_type: AudioType;
      sync_result: SyncResult;
    };
  };
}
