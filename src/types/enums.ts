import type { Database } from "./database";

type Enums = Database["public"]["Enums"];

export type AiringStatus = Enums["airing_status"];
export type AudioType = Enums["audio_type"];
export type MediaType = Enums["media_type"];
export type SyncResult = Enums["sync_result"];
export type UserRole = Enums["user_role"];
export type WatchStatus = Enums["watch_status"];
