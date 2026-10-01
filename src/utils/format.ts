export const formatNumber = (val: number | null | undefined, decimals = 2, fallback = 'N/A'): string => {
  if (val === null || val === undefined || isNaN(val) || !isFinite(val)) {
    return fallback;
  }
  return val.toFixed(decimals);
};

export const formatCurrency = (val: number | null | undefined, fallback = 'N/A'): string => {
  if (val === null || val === undefined || isNaN(val) || !isFinite(val)) {
    return fallback;
  }
  return `$${val.toFixed(2)}`;
};

export const formatPercent = (val: number | null | undefined, fallback = 'N/A'): string => {
  if (val === null || val === undefined || isNaN(val) || !isFinite(val)) {
    return fallback;
  }
  return `${(val * 100).toFixed(2)}%`;
};
