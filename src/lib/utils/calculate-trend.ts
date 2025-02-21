export const calculateTrend = (current: number, previous: number) => {
  if (previous === 0) {
    return current > 0 ? 100 : 0;
  }
  // ((current - previous) / previous) * 100 = percentage change
  return Number((((current - previous) / previous) * 100).toFixed(1));
};

export const getTrendDescription = (from?: Date, to?: Date) => {
  if (!from || !to) return "vs. previous period";
  
  const diffInDays = Math.ceil((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24));
  if (diffInDays <= 1) return "vs. yesterday";
  if (diffInDays <= 7) return "vs. last week";
  if (diffInDays <= 30) return "vs. last month";
  return "vs. previous period";
};
