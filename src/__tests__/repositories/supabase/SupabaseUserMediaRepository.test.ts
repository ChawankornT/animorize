import { describe, it, expect, vi } from "vitest";
import { SupabaseUserMediaRepository } from "@/repositories/supabase/SupabaseUserMediaRepository";
import type { SupabaseDb } from "@/lib/supabase/types";

function makeUserMediaRow(overrides: Record<string, unknown> = {}) {
  return {
    id: "um-1",
    user_id: "user-1",
    media_id: "media-1",
    provider_id: null,
    audio: "sub",
    status: "watching",
    current_episode: 6,
    is_favorite: false,
    custom_url: null,
    started_at: "2026-01-01T00:00:00Z",
    completed_at: null,
    rewatch_count: 0,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
    ...overrides,
  };
}

function makeMockSupabase(rpcResult: { data: unknown; error: unknown }) {
  return { rpc: vi.fn().mockResolvedValue(rpcResult) } as unknown as SupabaseDb;
}

describe("SupabaseUserMediaRepository.incrementEpisode", () => {
  it("returns updated when RPC returns a valid row", async () => {
    const sb = makeMockSupabase({ data: makeUserMediaRow(), error: null });
    const repo = new SupabaseUserMediaRepository(sb);

    const result = await repo.incrementEpisode("um-1", 5);

    expect(result.status).toBe("updated");
    if (result.status === "updated") {
      expect(result.userMedia.id).toBe("um-1");
    }
  });

  it("returns stale when RPC returns JS null (CAS miss)", async () => {
    const sb = makeMockSupabase({ data: null, error: null });
    const repo = new SupabaseUserMediaRepository(sb);

    const result = await repo.incrementEpisode("um-1", 5);

    expect(result).toEqual({ status: "stale" });
  });

  it("returns stale when RPC returns all-null composite object", async () => {
    const allNullRow = {
      id: null,
      user_id: null,
      media_id: null,
      provider_id: null,
      audio: null,
      status: null,
      current_episode: null,
      is_favorite: null,
      custom_url: null,
      started_at: null,
      completed_at: null,
      rewatch_count: null,
      created_at: null,
      updated_at: null,
    };
    const sb = makeMockSupabase({ data: allNullRow, error: null });
    const repo = new SupabaseUserMediaRepository(sb);

    const result = await repo.incrementEpisode("um-1", 5);

    expect(result).toEqual({ status: "stale" });
  });

  it("throws when RPC returns an error", async () => {
    const sb = makeMockSupabase({ data: null, error: { message: "DB error" } });
    const repo = new SupabaseUserMediaRepository(sb);

    await expect(repo.incrementEpisode("um-1", 5)).rejects.toThrow("Failed to increment episode");
  });
});
