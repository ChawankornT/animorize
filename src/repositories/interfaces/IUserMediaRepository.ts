import type {
  UserMedia,
  UserMediaWithMedia,
  AddToLibraryInput,
  AudioType,
  WatchStatus,
} from "@/domain/entities/UserMedia";

export interface UpdateProviderInput {
  providerId: string | null;
  audio: AudioType;
  customUrl: string | null;
}

export type IncrementEpisodeResult =
  | { status: "updated"; userMedia: UserMedia }
  | { status: "stale" };

export interface IUserMediaRepository {
  add(input: AddToLibraryInput): Promise<UserMedia>;
  findByUserId(userId: string): Promise<UserMediaWithMedia[]>;
  findMediaIdsByUserId(userId: string): Promise<string[]>;
  findByUserAndMedia(userId: string, mediaId: string): Promise<UserMedia | null>;
  findWithMediaByUserAndMedia(userId: string, mediaId: string): Promise<UserMediaWithMedia | null>;
  updateFavorite(id: string, isFavorite: boolean): Promise<UserMedia>;
  updateStatus(id: string, status: WatchStatus): Promise<UserMedia>;
  updateProvider(id: string, input: UpdateProviderInput): Promise<UserMedia>;
  remove(id: string): Promise<void>;
  incrementEpisode(userMediaId: string, fromEpisode: number): Promise<IncrementEpisodeResult>;
  startRewatch(userMediaId: string): Promise<UserMedia | null>;
  unmarkWatched(userMediaId: string): Promise<UserMedia>;
}
