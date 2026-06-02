import type {
  Provider,
  CreateProviderInput,
  UpdateProviderInput,
} from "@/domain/entities/Provider";

export interface IProviderRepository {
  findAll(): Promise<Provider[]>;
  findById(id: string): Promise<Provider | null>;
  findBySlug(slug: string): Promise<Provider | null>;
  create(data: CreateProviderInput): Promise<Provider>;
  update(id: string, data: UpdateProviderInput): Promise<Provider>;
  delete(id: string): Promise<void>;
}
