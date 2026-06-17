import { describe, it, expect, vi } from "vitest";
import { incrementEpisode } from "@/domain/usecases/IncrementEpisode";
import { createMockUserMediaRepository, makeUserMedia } from "@/__tests__/utils/mockRepositories";

describe("incrementEpisode", () => {
  it("delegates to repo.incrementEpisode and returns updated result", async () => {
    const updated = makeUserMedia({ currentEpisode: 6, status: "watching" });
    const repo = createMockUserMediaRepository();
    repo.incrementEpisode = vi.fn().mockResolvedValue({ status: "updated", userMedia: updated });

    const result = await incrementEpisode(repo, "um-1", 5);

    expect(repo.incrementEpisode).toHaveBeenCalledWith("um-1", 5);
    expect(result.status).toBe("updated");
    if (result.status === "updated") {
      expect(result.userMedia.currentEpisode).toBe(6);
    }
  });

  it("returns stale when CAS guard misses", async () => {
    const repo = createMockUserMediaRepository();
    repo.incrementEpisode = vi.fn().mockResolvedValue({ status: "stale" });

    const result = await incrementEpisode(repo, "um-1", 5);

    expect(result.status).toBe("stale");
  });

  it("propagates repository errors", async () => {
    const repo = createMockUserMediaRepository();
    repo.incrementEpisode = vi.fn().mockRejectedValue(new Error("DB error"));

    await expect(incrementEpisode(repo, "um-1", 5)).rejects.toThrow("DB error");
  });
});
