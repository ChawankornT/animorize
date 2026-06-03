import { describe, it, expect, vi } from "vitest";
import { listUserLibrary } from "@/domain/usecases/ListUserLibrary";
import {
  createMockUserMediaRepository,
  makeUserMediaWithMedia,
} from "@/__tests__/utils/mockRepositories";

describe("listUserLibrary", () => {
  it("returns all items when filter=all", async () => {
    const watching = makeUserMediaWithMedia({ id: "um-1", status: "watching" });
    const completed = makeUserMediaWithMedia({
      id: "um-2",
      status: "completed",
      isFavorite: false,
    });
    const repo = createMockUserMediaRepository();
    repo.findByUserId = vi.fn().mockResolvedValue([watching, completed]);

    const result = await listUserLibrary(repo, "user-1", "all");

    expect(result).toHaveLength(2);
    expect(repo.findByUserId).toHaveBeenCalledWith("user-1");
  });

  it("returns only watching + favorites when filter=dashboard", async () => {
    const watching = makeUserMediaWithMedia({ id: "um-1", status: "watching", isFavorite: false });
    const favCompleted = makeUserMediaWithMedia({
      id: "um-2",
      status: "completed",
      isFavorite: true,
    });
    const plain = makeUserMediaWithMedia({
      id: "um-3",
      status: "plan_to_watch",
      isFavorite: false,
    });
    const repo = createMockUserMediaRepository();
    repo.findByUserId = vi.fn().mockResolvedValue([watching, favCompleted, plain]);

    const result = await listUserLibrary(repo, "user-1", "dashboard");

    expect(result).toHaveLength(2);
    expect(result.map(r => r.id)).toEqual(["um-1", "um-2"]);
  });

  it("defaults to filter=all when no filter specified", async () => {
    const repo = createMockUserMediaRepository();
    repo.findByUserId = vi
      .fn()
      .mockResolvedValue([makeUserMediaWithMedia({ status: "completed", isFavorite: false })]);

    const result = await listUserLibrary(repo, "user-1");

    expect(result).toHaveLength(1);
  });

  it("returns empty array when library is empty", async () => {
    const repo = createMockUserMediaRepository();
    repo.findByUserId = vi.fn().mockResolvedValue([]);

    const result = await listUserLibrary(repo, "user-1", "dashboard");

    expect(result).toHaveLength(0);
  });
});
