import { describe, it, expect } from "vitest";
import { listMedia } from "@/domain/usecases/ListMedia";
import { createMockMediaRepository } from "@/__tests__/utils/mockRepositories";

describe("listMedia", () => {
  it("passes search option through to repository", async () => {
    const repo = createMockMediaRepository();

    await listMedia(repo, { search: "kimetsu" });

    expect(repo.findAll).toHaveBeenCalledWith({ search: "kimetsu" });
  });

  it("passes all options including search to repository", async () => {
    const repo = createMockMediaRepository();

    await listMedia(repo, { franchiseId: "f-1", mediaType: "anime", search: "demon" });

    expect(repo.findAll).toHaveBeenCalledWith({
      franchiseId: "f-1",
      mediaType: "anime",
      search: "demon",
    });
  });

  it("returns media array from repository", async () => {
    const repo = createMockMediaRepository();

    const result = await listMedia(repo, { search: "test" });

    expect(result).toHaveLength(1);
    expect(result[0].titleEn).toBe("Test Media");
  });
});
