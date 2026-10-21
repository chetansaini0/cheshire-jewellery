export type RetryOptions = {
  attempts?: number;
  baseDelayMs?: number;
  maxDelayMs?: number;
};

export async function withBackoff<T>(
  fn: (attempt: number) => Promise<T>,
  isRetryable: (error: unknown) => boolean,
  opts: RetryOptions = {}
): Promise<T> {
  const attempts = opts.attempts ?? 3;
  const base = opts.baseDelayMs ?? 200;
  const max = opts.maxDelayMs ?? 2_000;
  let last: unknown;
  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      return await fn(attempt);
    } catch (error) {
      last = error;
      if (attempt === attempts || !isRetryable(error)) throw error;
      const delay = Math.min(max, base * 2 ** (attempt - 1));
      await new Promise((r) => setTimeout(r, delay));
    }
  }
  throw last;
}

export function isRetryableSafeError(error: unknown) {
  if (error && typeof error === "object" && "retryable" in error) {
    return Boolean((error as { retryable?: boolean }).retryable);
  }
  return false;
}
