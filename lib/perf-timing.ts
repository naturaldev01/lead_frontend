const timings = new Map<string, number>();

export function startTiming(label: string): void {
  timings.set(label, performance.now());
}

export function endTiming(label: string, logThreshold = 200): number {
  const start = timings.get(label);
  if (!start) return 0;
  
  const elapsed = performance.now() - start;
  timings.delete(label);
  
  if (elapsed > logThreshold) {
    console.log(`[Perf] ${label}: ${elapsed.toFixed(0)}ms${elapsed > 500 ? ' [SLOW]' : ''}`);
  }
  
  return elapsed;
}

export function measureAsync<T>(
  label: string,
  fn: () => Promise<T>,
  logThreshold = 200
): Promise<T> {
  startTiming(label);
  return fn().finally(() => endTiming(label, logThreshold));
}

export function logDashboardMetrics(metrics: {
  totalTime: number;
  statsTime?: number;
  chartsTime?: number;
  tablesTime?: number;
}): void {
  const { totalTime, statsTime, chartsTime, tablesTime } = metrics;
  
  if (totalTime > 1000) {
    console.warn(`[Dashboard] Total load time: ${totalTime.toFixed(0)}ms [SLOW]`);
    if (statsTime) console.log(`  - Stats: ${statsTime.toFixed(0)}ms`);
    if (chartsTime) console.log(`  - Charts: ${chartsTime.toFixed(0)}ms`);
    if (tablesTime) console.log(`  - Tables: ${tablesTime.toFixed(0)}ms`);
  }
}
