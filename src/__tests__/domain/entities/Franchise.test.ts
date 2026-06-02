import { describe, it, expect } from "vitest";
import { validateFranchise } from "@/domain/entities/Franchise";

describe("validateFranchise", () => {
  it("throws when no title is provided", () => {
    expect(() => validateFranchise({})).toThrow("at least one title");
  });

  it("throws when all titles are null", () => {
    expect(() => validateFranchise({ titleTh: null, titleEn: null, titleRomaji: null })).toThrow(
      "at least one title",
    );
  });

  it("passes when only titleEn is provided", () => {
    expect(() => validateFranchise({ titleEn: "EN" })).not.toThrow();
  });

  it("passes when only titleRomaji is provided", () => {
    expect(() => validateFranchise({ titleRomaji: "Romaji" })).not.toThrow();
  });

  it("passes when only titleTh is provided", () => {
    expect(() => validateFranchise({ titleTh: "TH" })).not.toThrow();
  });
});
