export function calculateAverageUsage(data: number[]): number {
  if (!data || data.length === 0) return 0;
  const total = data.reduce((sum, value) => sum + value, 0);
  return Number((total / data.length).toFixed(1));
}

export function calculateGrowthRate(current: number, previous: number): number {
  if (!previous) return 0;
  const rate = ((current - previous) / previous) * 100;
  return Number(rate.toFixed(1));
}

export function calculatePercentage(value: number, total: number): number {
  if (!total) return 0;
  return Number(((value / total) * 100).toFixed(1));
}
