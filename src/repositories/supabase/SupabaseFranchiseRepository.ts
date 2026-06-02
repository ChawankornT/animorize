import type { SupabaseDb } from "@/lib/supabase/types";
import type { IFranchiseRepository } from "@/repositories/interfaces/IFranchiseRepository";
import type {
  Franchise,
  CreateFranchiseInput,
  UpdateFranchiseInput,
} from "@/domain/entities/Franchise";
import {
  toFranchise,
  fromCreateFranchiseInput,
  fromUpdateFranchiseInput,
} from "@/repositories/supabase/mappers";
import { sanitizeSearchTerm } from "@/lib/supabase/sanitizeSearchTerm";

export class SupabaseFranchiseRepository implements IFranchiseRepository {
  constructor(private readonly supabase: SupabaseDb) {}

  async findAll(options?: { search?: string }): Promise<Franchise[]> {
    let query = this.supabase.from("franchises").select("*").order("title_en");

    if (options?.search) {
      const q = sanitizeSearchTerm(options.search);
      if (q) {
        query = query.or(`title_th.ilike.%${q}%,title_en.ilike.%${q}%,title_romaji.ilike.%${q}%`);
      }
    }

    const { data, error } = await query;
    if (error) throw new Error(`Failed to list franchises: ${error.message}`);
    return (data ?? []).map(toFranchise);
  }

  async findById(id: string): Promise<Franchise | null> {
    const { data, error } = await this.supabase
      .from("franchises")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") return null;
      throw new Error(`Failed to find franchise: ${error.message}`);
    }
    return toFranchise(data);
  }

  async create(input: CreateFranchiseInput): Promise<Franchise> {
    const { data, error } = await this.supabase
      .from("franchises")
      .insert(fromCreateFranchiseInput(input))
      .select()
      .single();

    if (error) throw new Error(`Failed to create franchise: ${error.message}`);
    return toFranchise(data);
  }

  async update(id: string, input: UpdateFranchiseInput): Promise<Franchise> {
    const { data, error } = await this.supabase
      .from("franchises")
      .update(fromUpdateFranchiseInput(input))
      .eq("id", id)
      .select()
      .single();

    if (error) {
      if (error.code === "PGRST116") throw new Error(`Franchise not found: ${id}`);
      throw new Error(`Failed to update franchise: ${error.message}`);
    }
    return toFranchise(data);
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.supabase.from("franchises").delete().eq("id", id);

    if (error) throw new Error(`Failed to delete franchise: ${error.message}`);
  }
}
