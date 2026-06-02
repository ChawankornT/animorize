import { describe, it, expect } from "vitest";
import { librarySort } from "@/lib/utils/librarySort";
import { makeUserMediaWithMedia } from "../utils/mockRepositories";

describe("librarySort", () => {
  it("sorts by status priority (watching < plan_to_watch < on_hold < completed < dropped)", () => {
    const dropped = makeUserMediaWithMedia({
      id: "d",
      status: "dropped",
      updatedAt: "2026-01-01T00:00:00Z",
    });
    const watching = makeUserMediaWithMedia({
      id: "w",
      status: "watching",
      updatedAt: "2026-01-01T00:00:00Z",
    });
    const completed = makeUserMediaWithMedia({
      id: "c",
      status: "completed",
      updatedAt: "2026-01-01T00:00:00Z",
    });
    const plan = makeUserMediaWithMedia({
      id: "p",
      status: "plan_to_watch",
      updatedAt: "2026-01-01T00:00:00Z",
    });
    const onHold = makeUserMediaWithMedia({
      id: "h",
      status: "on_hold",
      updatedAt: "2026-01-01T00:00:00Z",
    });

    const result = [dropped, completed, plan, watching, onHold].sort(librarySort);

    expect(result.map(r => r.status)).toEqual([
      "watching",
      "plan_to_watch",
      "on_hold",
      "completed",
      "dropped",
    ]);
  });

  it("within same status, favorites come first", () => {
    const fav = makeUserMediaWithMedia({
      id: "f",
      status: "watching",
      isFavorite: true,
      updatedAt: "2026-01-01T00:00:00Z",
    });
    const notFav = makeUserMediaWithMedia({
      id: "n",
      status: "watching",
      isFavorite: false,
      updatedAt: "2026-01-02T00:00:00Z",
    });

    const result = [notFav, fav].sort(librarySort);

    expect(result.map(r => r.id)).toEqual(["f", "n"]);
  });

  it("within same status and favorite, sorts by updatedAt DESC", () => {
    const older = makeUserMediaWithMedia({
      id: "old",
      status: "watching",
      isFavorite: false,
      updatedAt: "2026-01-01T00:00:00Z",
    });
    const newer = makeUserMediaWithMedia({
      id: "new",
      status: "watching",
      isFavorite: false,
      updatedAt: "2026-01-05T00:00:00Z",
    });

    const result = [older, newer].sort(librarySort);

    expect(result.map(r => r.id)).toEqual(["new", "old"]);
  });

  it("favorite does not override status priority (completed+fav stays below watching)", () => {
    const watchingNotFav = makeUserMediaWithMedia({
      id: "w",
      status: "watching",
      isFavorite: false,
      updatedAt: "2026-01-01T00:00:00Z",
    });
    const completedFav = makeUserMediaWithMedia({
      id: "cf",
      status: "completed",
      isFavorite: true,
      updatedAt: "2026-01-05T00:00:00Z",
    });

    const result = [completedFav, watchingNotFav].sort(librarySort);

    expect(result.map(r => r.id)).toEqual(["w", "cf"]);
  });

  it("handles mixed items correctly", () => {
    const items = [
      makeUserMediaWithMedia({
        id: "a",
        status: "completed",
        isFavorite: false,
        updatedAt: "2026-01-03T00:00:00Z",
      }),
      makeUserMediaWithMedia({
        id: "b",
        status: "watching",
        isFavorite: true,
        updatedAt: "2026-01-01T00:00:00Z",
      }),
      makeUserMediaWithMedia({
        id: "c",
        status: "watching",
        isFavorite: false,
        updatedAt: "2026-01-04T00:00:00Z",
      }),
      makeUserMediaWithMedia({
        id: "d",
        status: "plan_to_watch",
        isFavorite: true,
        updatedAt: "2026-01-02T00:00:00Z",
      }),
      makeUserMediaWithMedia({
        id: "e",
        status: "dropped",
        isFavorite: false,
        updatedAt: "2026-01-05T00:00:00Z",
      }),
    ];

    const result = items.sort(librarySort);

    expect(result.map(r => r.id)).toEqual(["b", "c", "d", "a", "e"]);
  });
});
