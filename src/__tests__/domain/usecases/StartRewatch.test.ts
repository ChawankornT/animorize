import { describe, it, expect, vi } from "vitest";
import { startRewatch } from "@/domain/usecases/StartRewatch";
import { createMockUserMediaRepository, makeUserMedia } from "@/__tests__/utils/mockRepositories";

describe("startRewatch", () => {
  it("delegates to repo.startRewatch and returns updated UserMedia", async () => {
    const restarted = makeUserMedia({
      currentEpisode: 0,
      status: "watching",
      rewatchCount: 1,
    });
    const repo = createMockUserMediaRepository();
    repo.startRewatch = vi.fn().mockResolvedValue(restarted);

    const result = await startRewatch(repo, "um-1");

    expect(repo.startRewatch).toHaveBeenCalledWith("um-1");
    expect(result).not.toBeNull();
    expect(result!.currentEpisode).toBe(0);
    expect(result!.status).toBe("watching");
    expect(result!.rewatchCount).toBe(1);
  });

  it("returns null when status guard misses (double-fire / wrong source status)", async () => {
    const repo = createMockUserMediaRepository();
    repo.startRewatch = vi.fn().mockResolvedValue(null);

    const result = await startRewatch(repo, "um-1");

    expect(result).toBeNull();
  });

  it("propagates repository errors", async () => {
    const repo = createMockUserMediaRepository();
    repo.startRewatch = vi.fn().mockRejectedValue(new Error("DB error"));

    await expect(startRewatch(repo, "um-1")).rejects.toThrow("DB error");
  });
});
