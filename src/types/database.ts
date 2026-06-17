export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5";
  };
  public: {
    Tables: {
      franchises: {
        Row: {
          created_at: string;
          id: string;
          poster_url: string | null;
          synopsis: string | null;
          title_en: string | null;
          title_romaji: string | null;
          title_th: string | null;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          poster_url?: string | null;
          synopsis?: string | null;
          title_en?: string | null;
          title_romaji?: string | null;
          title_th?: string | null;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          poster_url?: string | null;
          synopsis?: string | null;
          title_en?: string | null;
          title_romaji?: string | null;
          title_th?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      media: {
        Row: {
          air_date_end: string | null;
          air_date_start: string | null;
          airing_status: Database["public"]["Enums"]["airing_status"];
          anilist_id: number | null;
          auto_sync: boolean;
          created_at: string;
          franchise_id: string | null;
          genres: string[];
          id: string;
          media_type: Database["public"]["Enums"]["media_type"];
          poster_url: string | null;
          season_quarter: number | null;
          season_year: number | null;
          sort_order: number;
          synopsis: string | null;
          title_en: string | null;
          title_romaji: string | null;
          title_th: string | null;
          total_episodes: number;
          updated_at: string;
        };
        Insert: {
          air_date_end?: string | null;
          air_date_start?: string | null;
          airing_status?: Database["public"]["Enums"]["airing_status"];
          anilist_id?: number | null;
          auto_sync?: boolean;
          created_at?: string;
          franchise_id?: string | null;
          genres?: string[];
          id?: string;
          media_type: Database["public"]["Enums"]["media_type"];
          poster_url?: string | null;
          season_quarter?: number | null;
          season_year?: number | null;
          sort_order?: number;
          synopsis?: string | null;
          title_en?: string | null;
          title_romaji?: string | null;
          title_th?: string | null;
          total_episodes?: number;
          updated_at?: string;
        };
        Update: {
          air_date_end?: string | null;
          air_date_start?: string | null;
          airing_status?: Database["public"]["Enums"]["airing_status"];
          anilist_id?: number | null;
          auto_sync?: boolean;
          created_at?: string;
          franchise_id?: string | null;
          genres?: string[];
          id?: string;
          media_type?: Database["public"]["Enums"]["media_type"];
          poster_url?: string | null;
          season_quarter?: number | null;
          season_year?: number | null;
          sort_order?: number;
          synopsis?: string | null;
          title_en?: string | null;
          title_romaji?: string | null;
          title_th?: string | null;
          total_episodes?: number;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "media_franchise_id_fkey";
            columns: ["franchise_id"];
            isOneToOne: false;
            referencedRelation: "franchises";
            referencedColumns: ["id"];
          },
        ];
      };
      media_providers: {
        Row: {
          audio: Database["public"]["Enums"]["audio_type"];
          base_url: string | null;
          created_at: string;
          id: string;
          media_id: string;
          provider_id: string;
        };
        Insert: {
          audio?: Database["public"]["Enums"]["audio_type"];
          base_url?: string | null;
          created_at?: string;
          id?: string;
          media_id: string;
          provider_id: string;
        };
        Update: {
          audio?: Database["public"]["Enums"]["audio_type"];
          base_url?: string | null;
          created_at?: string;
          id?: string;
          media_id?: string;
          provider_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "media_providers_media_id_fkey";
            columns: ["media_id"];
            isOneToOne: false;
            referencedRelation: "media";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "media_providers_provider_id_fkey";
            columns: ["provider_id"];
            isOneToOne: false;
            referencedRelation: "providers";
            referencedColumns: ["id"];
          },
        ];
      };
      profiles: {
        Row: {
          avatar_url: string | null;
          created_at: string;
          display_name: string | null;
          id: string;
          role: Database["public"]["Enums"]["user_role"];
          updated_at: string;
        };
        Insert: {
          avatar_url?: string | null;
          created_at?: string;
          display_name?: string | null;
          id: string;
          role?: Database["public"]["Enums"]["user_role"];
          updated_at?: string;
        };
        Update: {
          avatar_url?: string | null;
          created_at?: string;
          display_name?: string | null;
          id?: string;
          role?: Database["public"]["Enums"]["user_role"];
          updated_at?: string;
        };
        Relationships: [];
      };
      providers: {
        Row: {
          base_url: string | null;
          color: string;
          created_at: string;
          id: string;
          logo_url: string | null;
          name: string;
          slug: string;
          updated_at: string;
        };
        Insert: {
          base_url?: string | null;
          color: string;
          created_at?: string;
          id?: string;
          logo_url?: string | null;
          name: string;
          slug: string;
          updated_at?: string;
        };
        Update: {
          base_url?: string | null;
          color?: string;
          created_at?: string;
          id?: string;
          logo_url?: string | null;
          name?: string;
          slug?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      sync_logs: {
        Row: {
          error_message: string | null;
          id: string;
          media_id: string;
          result: Database["public"]["Enums"]["sync_result"];
          synced_at: string;
        };
        Insert: {
          error_message?: string | null;
          id?: string;
          media_id: string;
          result: Database["public"]["Enums"]["sync_result"];
          synced_at?: string;
        };
        Update: {
          error_message?: string | null;
          id?: string;
          media_id?: string;
          result?: Database["public"]["Enums"]["sync_result"];
          synced_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "sync_logs_media_id_fkey";
            columns: ["media_id"];
            isOneToOne: false;
            referencedRelation: "media";
            referencedColumns: ["id"];
          },
        ];
      };
      system_settings: {
        Row: {
          auto_sync_enabled: boolean;
          id: number;
          updated_at: string;
        };
        Insert: {
          auto_sync_enabled?: boolean;
          id?: number;
          updated_at?: string;
        };
        Update: {
          auto_sync_enabled?: boolean;
          id?: number;
          updated_at?: string;
        };
        Relationships: [];
      };
      user_media: {
        Row: {
          audio: Database["public"]["Enums"]["audio_type"];
          completed_at: string | null;
          created_at: string;
          current_episode: number;
          custom_url: string | null;
          id: string;
          is_favorite: boolean;
          media_id: string;
          provider_id: string | null;
          rewatch_count: number;
          started_at: string | null;
          status: Database["public"]["Enums"]["watch_status"];
          updated_at: string;
          user_id: string;
        };
        Insert: {
          audio?: Database["public"]["Enums"]["audio_type"];
          completed_at?: string | null;
          created_at?: string;
          current_episode?: number;
          custom_url?: string | null;
          id?: string;
          is_favorite?: boolean;
          media_id: string;
          provider_id?: string | null;
          rewatch_count?: number;
          started_at?: string | null;
          status?: Database["public"]["Enums"]["watch_status"];
          updated_at?: string;
          user_id: string;
        };
        Update: {
          audio?: Database["public"]["Enums"]["audio_type"];
          completed_at?: string | null;
          created_at?: string;
          current_episode?: number;
          custom_url?: string | null;
          id?: string;
          is_favorite?: boolean;
          media_id?: string;
          provider_id?: string | null;
          rewatch_count?: number;
          started_at?: string | null;
          status?: Database["public"]["Enums"]["watch_status"];
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "user_media_media_id_fkey";
            columns: ["media_id"];
            isOneToOne: false;
            referencedRelation: "media";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "user_media_provider_id_fkey";
            columns: ["provider_id"];
            isOneToOne: false;
            referencedRelation: "providers";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "user_media_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      watchlogs: {
        Row: {
          episode_number: number;
          id: string;
          media_id: string;
          user_id: string;
          watched_at: string;
        };
        Insert: {
          episode_number: number;
          id?: string;
          media_id: string;
          user_id: string;
          watched_at?: string;
        };
        Update: {
          episode_number?: number;
          id?: string;
          media_id?: string;
          user_id?: string;
          watched_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "watchlogs_media_id_fkey";
            columns: ["media_id"];
            isOneToOne: false;
            referencedRelation: "media";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "watchlogs_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      increment_episode: {
        Args: { p_from_episode: number; p_user_media_id: string };
        Returns: {
          audio: Database["public"]["Enums"]["audio_type"];
          completed_at: string | null;
          created_at: string;
          current_episode: number;
          custom_url: string | null;
          id: string;
          is_favorite: boolean;
          media_id: string;
          provider_id: string | null;
          rewatch_count: number;
          started_at: string | null;
          status: Database["public"]["Enums"]["watch_status"];
          updated_at: string;
          user_id: string;
        };
        SetofOptions: {
          from: "*";
          to: "user_media";
          isOneToOne: true;
          isSetofReturn: false;
        };
      };
      is_admin: { Args: never; Returns: boolean };
    };
    Enums: {
      airing_status: "ongoing" | "finished" | "upcoming";
      audio_type: "sub" | "dub";
      media_type: "anime" | "series" | "movie" | "ova" | "special";
      sync_result: "success" | "failed";
      user_role: "user" | "admin";
      watch_status: "watching" | "completed" | "on_hold" | "dropped" | "plan_to_watch";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {
      airing_status: ["ongoing", "finished", "upcoming"],
      audio_type: ["sub", "dub"],
      media_type: ["anime", "series", "movie", "ova", "special"],
      sync_result: ["success", "failed"],
      user_role: ["user", "admin"],
      watch_status: ["watching", "completed", "on_hold", "dropped", "plan_to_watch"],
    },
  },
} as const;
