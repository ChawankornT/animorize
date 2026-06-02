import type { SyncResult } from "@/types/database";

export type { SyncResult };

export interface SyncLog {
  id: string;
  mediaId: string;
  result: SyncResult;
  errorMessage: string | null;
  syncedAt: string;
  mediaTitle?: string;
}

export interface CreateSyncLogInput {
  mediaId: string;
  result: SyncResult;
  errorMessage?: string | null;
}
