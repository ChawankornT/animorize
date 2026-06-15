import { describe, it, expect } from "vitest";
import { SupabaseError, isPgUniqueViolation } from "@/lib/supabase/errors";

describe("isPgUniqueViolation", () => {
  it("returns true for SupabaseError with code 23505", () => {
    expect(isPgUniqueViolation(new SupabaseError("duplicate", "23505"))).toBe(true);
  });

  it("returns false for SupabaseError with different code", () => {
    expect(isPgUniqueViolation(new SupabaseError("fk violation", "23503"))).toBe(false);
  });

  it("returns false for SupabaseError without code", () => {
    expect(isPgUniqueViolation(new SupabaseError("no code"))).toBe(false);
  });

  it("returns false for plain Error", () => {
    expect(isPgUniqueViolation(new Error("plain"))).toBe(false);
  });

  it("returns false for null", () => {
    expect(isPgUniqueViolation(null)).toBe(false);
  });

  it("returns false for undefined", () => {
    expect(isPgUniqueViolation(undefined)).toBe(false);
  });
});
