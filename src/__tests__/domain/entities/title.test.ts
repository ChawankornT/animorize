import { describe, it, expect } from "vitest";
import { getDisplayTitle } from "@/domain/entities/title";

describe("getDisplayTitle", () => {
  it("returns titleEn when all titles are present", () => {
    expect(getDisplayTitle({ titleEn: "EN", titleRomaji: "Romaji", titleTh: "TH" })).toBe("EN");
  });

  it("falls back to titleRomaji when titleEn is null", () => {
    expect(getDisplayTitle({ titleEn: null, titleRomaji: "Romaji", titleTh: "TH" })).toBe("Romaji");
  });

  it("falls back to titleRomaji when titleEn is undefined", () => {
    expect(getDisplayTitle({ titleRomaji: "Romaji", titleTh: "TH" })).toBe("Romaji");
  });

  it("falls back to titleTh when titleEn and titleRomaji are null", () => {
    expect(getDisplayTitle({ titleEn: null, titleRomaji: null, titleTh: "TH" })).toBe("TH");
  });

  it("returns empty string when all titles are null", () => {
    expect(getDisplayTitle({ titleEn: null, titleRomaji: null, titleTh: null })).toBe("");
  });

  it("returns empty string when called with empty object", () => {
    expect(getDisplayTitle({})).toBe("");
  });

  it("does not use titleTh before titleRomaji", () => {
    expect(getDisplayTitle({ titleRomaji: "Romaji", titleTh: "TH" })).toBe("Romaji");
  });
});
