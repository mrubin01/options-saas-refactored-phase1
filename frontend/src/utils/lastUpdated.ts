export function getLastUpdated<T extends { updated_at?: string | null }>(
  data: T[]
): string | null {
  if (!data.length) return null;

  const validDates = data
    .map((item) => item.updated_at)
    .filter((value): value is string => Boolean(value))
    .map((value) => new Date(value))
    .filter((date) => !Number.isNaN(date.getTime()));

  if (!validDates.length) return null;

  const latest = validDates.reduce((max, current) =>
    current > max ? current : max
  );

  return latest.toLocaleString();
}
