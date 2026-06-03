import type { MediaProvider, CreateMediaProviderInput } from "@/domain/entities/MediaProvider";

export interface IMediaProviderRepository {
  findByMediaId(mediaId: string): Promise<MediaProvider[]>;
  create(data: CreateMediaProviderInput): Promise<MediaProvider>;
  delete(id: string): Promise<void>;
}
