import { describe, it, expect } from "vitest";
import { formatTimestamp } from "@/lib/utils/formatTimestamp";

describe("formatTimestamp", () => {
  const now = new Date("2026-06-20T12:00:00Z");

  it("returns 'just now' for < 1 minute ago", () => {
    expect(formatTimestamp("2026-06-20T11:59:30Z", now)).toBe("just now");
  });

  it("returns minutes for < 1 hour ago", () => {
    expect(formatTimestamp("2026-06-20T11:45:00Z", now)).toBe("15m ago");
  });

  it("returns hours for < 24 hours ago", () => {
    expect(formatTimestamp("2026-06-20T06:00:00Z", now)).toBe("6h ago");
  });

  it("returns days for < 7 days ago", () => {
    expect(formatTimestamp("2026-06-17T12:00:00Z", now)).toBe("3d ago");
  });

  it("returns absolute date for >= 7 days ago", () => {
    const result = formatTimestamp("2026-01-15T10:00:00Z", now);
    expect(result).toMatch(/15.*Jan.*2026/);
  });

  it("floors partial values (2.9 hours → 2h)", () => {
    const almostThreeHours = new Date("2026-06-20T09:05:00Z");
    expect(formatTimestamp(almostThreeHours.toISOString(), now)).toBe("2h ago");
  });
});
