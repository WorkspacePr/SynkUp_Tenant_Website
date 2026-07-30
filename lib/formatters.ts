export const EMPTY_DISPLAY_VALUE = "—";

export function formatNumber(
  value: number | null | undefined,
  fallback = EMPTY_DISPLAY_VALUE,
) {
  return typeof value === "number" && Number.isFinite(value)
    ? new Intl.NumberFormat().format(value)
    : fallback;
}

export function formatDate(
  value: string | number | Date | null | undefined,
  fallback = EMPTY_DISPLAY_VALUE,
) {
  if (value === null || value === undefined || value === "") return fallback;
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    return typeof value === "string" ? value : fallback;
  }
  return new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(date);
}

export function formatDateTime(
  value: string | number | Date | null | undefined,
  fallback = EMPTY_DISPLAY_VALUE,
) {
  if (value === null || value === undefined || value === "") return fallback;
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    return typeof value === "string" ? value : fallback;
  }
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export function formatDisplayLabel(
  value: string | null | undefined,
  fallback = EMPTY_DISPLAY_VALUE,
) {
  if (!value?.trim()) return fallback;
  const namespacedValue = value.trim().split(".").at(-1) ?? value.trim();
  const words = namespacedValue
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
  return words ? `${words.charAt(0).toUpperCase()}${words.slice(1)}` : fallback;
}

export function formatDataValue(
  value: unknown,
  fallback = EMPTY_DISPLAY_VALUE,
): string {
  if (value === null || value === undefined || value === "") return fallback;
  if (typeof value === "number") return formatNumber(value, fallback);
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (Array.isArray(value)) {
    return value.map((item) => formatDataValue(item, fallback)).join(", ");
  }
  if (typeof value === "string") {
    const looksLikeIsoDate =
      /^\d{4}-\d{2}-\d{2}(?:T|\s)\d{2}:\d{2}/.test(value) ||
      /^\d{4}-\d{2}-\d{2}$/.test(value);
    return looksLikeIsoDate
      ? value.length === 10
        ? formatDate(value, fallback)
        : formatDateTime(value, fallback)
      : value;
  }
  if (typeof value === "object") {
    return Object.entries(value as Record<string, unknown>)
      .map(
        ([key, item]) =>
          `${formatDisplayLabel(key)}: ${formatDataValue(item, fallback)}`,
      )
      .join(", ");
  }
  return String(value);
}
