import { describe, it, expect, vi } from "vitest";
import { retrySync } from "@/domain/usecases/RetrySync";
import {
  createMockMediaRepository,
  createMockSyncLogRepository,
  makeMedia,
} from "@/__tests__/utils/mockRepositories";

describe("retrySync", () => {
  it("updates media and writes success log on happy path", async () => {
    const mediaRepo = createMockMediaRepository();
    const syncLogRepo = createMockSyncLogRepository();
    const fetchUpdate = vi.fn().mockResolvedValue({ titleRomaji: "Updated Romaji" });

    await retrySync(mediaRepo, syncLogRepo, "media-1", fetchUpdate);

    expect(mediaRepo.update).toHaveBeenCalledWith("media-1", { titleRomaji: "Updated Romaji" });
    expect(syncLogRepo.create).toHaveBeenCalledWith({ mediaId: "media-1", result: "success" });
  });

  it("returns the updated Media entity", async () => {
    const updated = makeMedia({ titleRomaji: "Updated" });
    const mediaRepo = createMockMediaRepository();
    (mediaRepo.update as ReturnType<typeof vi.fn>).mockResolvedValue(updated);
    const syncLogRepo = createMockSyncLogRepository();

    const result = await retrySync(
      mediaRepo,
      syncLogRepo,
      "media-1",
      vi.fn().mockResolvedValue({}),
    );

    expect(result).toBe(updated);
  });

  it("strips PROTECTED fields (titleTh, synopsis, posterUrl) from update input", async () => {
    const mediaRepo = createMockMediaRepository();
    const syncLogRepo = createMockSyncLogRepository();
    const fetchUpdate = vi.fn().mockResolvedValue({
      titleRomaji: "Romaji",
      titleTh: "Should be stripped",
      synopsis: "Should be stripped",
      posterUrl: "http://example.com/stripped.jpg",
    });

    await retrySync(mediaRepo, syncLogRepo, "media-1", fetchUpdate);

    const updateArg = (mediaRepo.update as ReturnType<typeof vi.fn>).mock.calls[0][1];
    expect(updateArg).not.toHaveProperty("titleTh");
    expect(updateArg).not.toHaveProperty("synopsis");
    expect(updateArg).not.toHaveProperty("posterUrl");
    expect(updateArg.titleRomaji).toBe("Romaji");
  });

  it("writes failed sync_log and rethrows when fetchUpdate throws", async () => {
    const mediaRepo = createMockMediaRepository();
    const syncLogRepo = createMockSyncLogRepository();
    const fetchError = new Error("AniList rate limited");
    const fetchUpdate = vi.fn().mockRejectedValue(fetchError);

    await expect(retrySync(mediaRepo, syncLogRepo, "media-1", fetchUpdate)).rejects.toThrow(
      "AniList rate limited",
    );

    expect(syncLogRepo.create).toHaveBeenCalledWith({
      mediaId: "media-1",
      result: "failed",
      errorMessage: "AniList rate limited",
    });
    expect(mediaRepo.update).not.toHaveBeenCalled();
  });

  it("writes failed sync_log and rethrows when mediaRepo.update throws", async () => {
    const mediaRepo = createMockMediaRepository();
    const updateError = new Error("DB update failed");
    (mediaRepo.update as ReturnType<typeof vi.fn>).mockRejectedValue(updateError);
    const syncLogRepo = createMockSyncLogRepository();

    await expect(
      retrySync(mediaRepo, syncLogRepo, "media-1", vi.fn().mockResolvedValue({})),
    ).rejects.toThrow("DB update failed");

    expect(syncLogRepo.create).toHaveBeenCalledWith({
      mediaId: "media-1",
      result: "failed",
      errorMessage: "DB update failed",
    });
  });
});
