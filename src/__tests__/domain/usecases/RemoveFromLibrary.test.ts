import { describe, it, expect } from "vitest";
import { removeFromLibrary } from "@/domain/usecases/RemoveFromLibrary";
import { createMockUserMediaRepository } from "@/__tests__/utils/mockRepositories";

describe("removeFromLibrary", () => {
  it("calls repository remove with the given id", async () => {
    const repo = createMockUserMediaRepository();

    await removeFromLibrary(repo, "um-1");

    expect(repo.remove).toHaveBeenCalledWith("um-1");
  });

  it("returns void", async () => {
    const repo = createMockUserMediaRepository();

    const result = await removeFromLibrary(repo, "um-1");

    expect(result).toBeUndefined();
  });
});
