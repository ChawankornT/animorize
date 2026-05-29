import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

// Database['public']['Tables'] lacks the `Relationships` field required by
// postgrest-js GenericTable, and Database['public'] lacks Views/Functions
// required by GenericSchema. Without these, SupabaseClient<Database> resolves
// Schema=never and every .insert()/.update() parameter becomes never[].
//
// CompatDatabase reshapes Database into a form that satisfies GenericSchema so
// the typed query builder resolves correctly. Row/Insert/Update types stay
// identical to Database — only the structural wrapper changes.

type MakeCompatTable<T extends {
  Row: Record<string, unknown>;
  Insert: Record<string, unknown>;
  Update: Record<string, unknown>;
}> = {
  Row: T['Row'];
  Insert: T['Insert'];
  Update: T['Update'];
  Relationships: never[];
};

type CompatTables = {
  [K in keyof Database['public']['Tables']]: MakeCompatTable<Database['public']['Tables'][K]>;
};

type CompatSchema = {
  Tables: CompatTables;
  Views: Record<string, never>;
  Functions: Record<string, never>;
  Enums: Database['public']['Enums'];
};

export type CompatDatabase = {
  public: CompatSchema;
};

export type SupabaseDb = SupabaseClient<CompatDatabase>;
