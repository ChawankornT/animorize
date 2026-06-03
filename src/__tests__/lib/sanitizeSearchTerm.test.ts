import { describe, it, expect } from "vitest";
import { sanitizeSearchTerm } from "@/lib/supabase/sanitizeSearchTerm";

describe("sanitizeSearchTerm", () => {
  it("strips ILIKE wildcards % and _", () => {
    expect(sanitizeSearchTerm("100%_done")).toBe("100done");
  });

  it("strips PostgREST structural chars", () => {
    expect(sanitizeSearchTerm("a,b;c(d)e*f\\g")).toBe("abcdefg");
  });

  it("preserves Thai characters", () => {
    expect(sanitizeSearchTerm("ดาบพิฆาตอสูร")).toBe("ดาบพิฆาตอสูร");
  });

  it("preserves Japanese/Unicode characters", () => {
    expect(sanitizeSearchTerm("鬼滅の刃")).toBe("鬼滅の刃");
  });

  it("trims whitespace", () => {
    expect(sanitizeSearchTerm("  hello  ")).toBe("hello");
  });

  it("returns empty string for only structural chars", () => {
    expect(sanitizeSearchTerm("%_,;()*\\")).toBe("");
  });

  it("preserves alphanumeric and spaces", () => {
    expect(sanitizeSearchTerm("Demon Slayer 2")).toBe("Demon Slayer 2");
  });
});
