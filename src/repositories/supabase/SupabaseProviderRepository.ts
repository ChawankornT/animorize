import type { SupabaseDb } from '@/lib/supabase/types';
import type { IProviderRepository } from '@/repositories/interfaces/IProviderRepository';
import type { Provider, CreateProviderInput, UpdateProviderInput } from '@/domain/entities/Provider';
import {
  toProvider,
  fromCreateProviderInput,
  fromUpdateProviderInput,
} from '@/repositories/supabase/mappers';

export class SupabaseProviderRepository implements IProviderRepository {
  constructor(private readonly supabase: SupabaseDb) {}

  async findAll(): Promise<Provider[]> {
    const { data, error } = await this.supabase
      .from('providers')
      .select('*')
      .order('name');

    if (error) throw new Error(`Failed to list providers: ${error.message}`);
    return (data ?? []).map(toProvider);
  }

  async findById(id: string): Promise<Provider | null> {
    const { data, error } = await this.supabase
      .from('providers')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error(`Failed to find provider: ${error.message}`);
    }
    return toProvider(data);
  }

  async findBySlug(slug: string): Promise<Provider | null> {
    const { data, error } = await this.supabase
      .from('providers')
      .select('*')
      .eq('slug', slug)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error(`Failed to find provider by slug: ${error.message}`);
    }
    return toProvider(data);
  }

  async create(input: CreateProviderInput): Promise<Provider> {
    const { data, error } = await this.supabase
      .from('providers')
      .insert(fromCreateProviderInput(input))
      .select()
      .single();

    if (error) throw new Error(`Failed to create provider: ${error.message}`);
    return toProvider(data);
  }

  async update(id: string, input: UpdateProviderInput): Promise<Provider> {
    const { data, error } = await this.supabase
      .from('providers')
      .update(fromUpdateProviderInput(input))
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') throw new Error(`Provider not found: ${id}`);
      throw new Error(`Failed to update provider: ${error.message}`);
    }
    return toProvider(data);
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('providers')
      .delete()
      .eq('id', id);

    if (error) throw new Error(`Failed to delete provider: ${error.message}`);
  }
}
