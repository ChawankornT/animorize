import type {
  Franchise,
  CreateFranchiseInput,
  UpdateFranchiseInput,
} from "@/domain/entities/Franchise";

export interface IFranchiseRepository {
  findAll(options?: { search?: string }): Promise<Franchise[]>;
  findById(id: string): Promise<Franchise | null>;
  create(data: CreateFranchiseInput): Promise<Franchise>;
  update(id: string, data: UpdateFranchiseInput): Promise<Franchise>;
  delete(id: string): Promise<void>;
}
