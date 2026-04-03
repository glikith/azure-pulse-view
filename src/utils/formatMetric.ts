export const formatMetricValue = (value: number, unit: string): string => {
  if (unit === 'Percent') return `${value.toFixed(1)}%`;
  if (unit === 'MBps') return `${value.toFixed(1)} MB/s`;
  if (unit === 'IOPS') return `${value.toLocaleString()} IOPS`;
  if (unit === 'Bytes') {
    if (value >= 1e12) return `${(value / 1e12).toFixed(2)} TB`;
    if (value >= 1e9) return `${(value / 1e9).toFixed(2)} GB`;
    if (value >= 1e6) return `${(value / 1e6).toFixed(2)} MB`;
    return `${value.toLocaleString()} B`;
  }
  if (unit === 'Count') return value.toLocaleString();
  return `${value.toFixed(1)} ${unit}`;
};

export const formatDelta = (delta: number): string => {
  const sign = delta >= 0 ? '+' : '';
  return `${sign}${delta.toFixed(1)}%`;
};

export const formatTimestamp = (iso: string): string => {
  try {
    const d = new Date(iso);
    return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
  } catch {
    return iso;
  }
};

export const formatFullTimestamp = (iso: string): string => {
  try {
    return new Date(iso).toISOString().replace('T', ' ').replace('Z', ' UTC');
  } catch {
    return iso;
  }
};
