import { describe, it, expect, vi } from "vitest";
import { unmarkWatched } from "@/domain/usecases/UnmarkWatched";
import { createMockUserMediaRepository, makeUserMedia } from "@/__tests__/utils/mockRepositories";

describe("unmarkWatched", () => {
  it("delegates to repo.unmarkWatched and returns reset UserMedia", async () => {
    const reset = makeUserMedia({
      currentEpisode: 0,
      status: "plan_to_watch",
      startedAt: null,
      completedAt: null,
    });
    const repo = createMockUserMediaRepository();
    repo.unmarkWatched = vi.fn().mockResolvedValue(reset);

    const result = await unmarkWatched(repo, "um-1");

    expect(repo.unmarkWatched).toHaveBeenCalledWith("um-1");
    expect(result.currentEpisode).toBe(0);
    expect(result.status).toBe("plan_to_watch");
    expect(result.startedAt).toBeNull();
    expect(result.completedAt).toBeNull();
  });

  it("propagates repository errors", async () => {
    const repo = createMockUserMediaRepository();
    repo.unmarkWatched = vi.fn().mockRejectedValue(new Error("Not found"));

    await expect(unmarkWatched(repo, "um-1")).rejects.toThrow("Not found");
  });
});
