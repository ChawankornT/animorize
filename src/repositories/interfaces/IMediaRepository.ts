import type {
  Media,
  CreateMediaInput,
  UpdateMediaInput,
  MediaType,
  AiringStatus,
} from "@/domain/entities/Media";

export interface IMediaRepository {
  findAll(options?: {
    franchiseId?: string;
    mediaType?: MediaType;
    airingStatus?: AiringStatus;
    search?: string;
  }): Promise<Media[]>;
  findById(id: string): Promise<Media | null>;
  findByAnilistId(anilistId: number): Promise<Media | null>;
  create(data: CreateMediaInput): Promise<Media>;
  update(id: string, data: UpdateMediaInput): Promise<Media>;
  delete(id: string): Promise<void>;
}
