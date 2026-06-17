import type { AudioType } from "@/types/enums";

export type { AudioType };

export interface MediaProvider {
  id: string;
  mediaId: string;
  providerId: string;
  audio: AudioType;
  baseUrl: string | null;
  createdAt: string;
  providerName: string;
  providerColor: string;
}

export interface CreateMediaProviderInput {
  mediaId: string;
  providerId: string;
  audio: AudioType;
  baseUrl?: string | null;
}
