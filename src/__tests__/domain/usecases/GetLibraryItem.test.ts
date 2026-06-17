import { describe, it, expect, vi } from "vitest";
import { getLibraryItem } from "@/domain/usecases/GetLibraryItem";
import {
  createMockUserMediaRepository,
  makeUserMediaWithMedia,
} from "@/__tests__/utils/mockRepositories";

describe("getLibraryItem", () => {
  it("returns UserMediaWithMedia when item exists in library", async () => {
    const item = makeUserMediaWithMedia({ mediaId: "media-1" });
    const repo = createMockUserMediaRepository();
    repo.findWithMediaByUserAndMedia = vi.fn().mockResolvedValue(item);

    const result = await getLibraryItem(repo, "user-1", "media-1");

    expect(repo.findWithMediaByUserAndMedia).toHaveBeenCalledWith("user-1", "media-1");
    expect(result).not.toBeNull();
    expect(result!.mediaId).toBe("media-1");
  });

  it("returns null when item is not in library", async () => {
    const repo = createMockUserMediaRepository();
    repo.findWithMediaByUserAndMedia = vi.fn().mockResolvedValue(null);

    const result = await getLibraryItem(repo, "user-1", "media-99");

    expect(result).toBeNull();
  });

  it("propagates repository errors", async () => {
    const repo = createMockUserMediaRepository();
    repo.findWithMediaByUserAndMedia = vi.fn().mockRejectedValue(new Error("DB error"));

    await expect(getLibraryItem(repo, "user-1", "media-1")).rejects.toThrow("DB error");
  });
});
