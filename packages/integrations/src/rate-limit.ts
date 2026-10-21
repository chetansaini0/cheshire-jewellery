export class SupplierRateLimiter {
  private hits = new Map<string, number[]>();

  constructor(
    private readonly perMinute = 30,
    private readonly perHour = 400,
    private readonly concurrency = 4
  ) {}

  private prune(list: number[], windowMs: number, now: number) {
    return list.filter((t) => now - t < windowMs);
  }

  tryAcquire(supplierId: string): { allowed: boolean; retryAfterMs?: number } {
    const now = Date.now();
    const prev = this.hits.get(supplierId) ?? [];
    const minute = this.prune(prev, 60_000, now);
    const hour = this.prune(prev, 3_600_000, now);
    if (minute.length >= this.perMinute) {
      return { allowed: false, retryAfterMs: 60_000 - (now - minute[0]) };
    }
    if (hour.length >= this.perHour) {
      return { allowed: false, retryAfterMs: 3_600_000 - (now - hour[0]) };
    }
    if (minute.length >= this.concurrency && now - minute[minute.length - 1] < 50) {
      return { allowed: false, retryAfterMs: 50 };
    }
    minute.push(now);
    this.hits.set(supplierId, hour.concat(now).slice(-this.perHour));
    return { allowed: true };
  }
}

export const defaultRateLimiter = new SupplierRateLimiter();
