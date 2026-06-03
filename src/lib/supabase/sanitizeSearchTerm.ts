// % _ = ILIKE wildcards · , ; ( ) = .or() delimiter/grouping · * = PostgREST glob · \ = escape
export function sanitizeSearchTerm(input: string): string {
  return input.replace(/[%_,;()*\\]/g, "").trim();
}
