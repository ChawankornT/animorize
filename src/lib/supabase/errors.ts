export class SupabaseError extends Error {
  readonly code: string | undefined;
  constructor(message: string, code?: string) {
    super(message);
    this.name = "SupabaseError";
    this.code = code;
  }
}

export function isPgUniqueViolation(err: unknown): boolean {
  return err instanceof SupabaseError && err.code === "23505";
}
