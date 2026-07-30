import { formatDisplayLabel } from "@/lib/formatters";

type ApiErrorRecord = Record<string, unknown>;

const metadataKeys = new Set([
  "code",
  "message",
  "detail",
  "error",
  "reason",
  "suggested_action",
  "upgrade_required",
  "status",
  "status_code",
]);

function isRecord(value: unknown): value is ApiErrorRecord {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function cleanText(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function humanizeKey(value: string) {
  return formatDisplayLabel(value, "");
}

function collectFieldErrors(value: unknown, path = ""): string[] {
  if (Array.isArray(value)) {
    return value.flatMap((item) => collectFieldErrors(item, path));
  }
  if (!isRecord(value)) {
    const text = cleanText(value);
    return text ? [path ? `${humanizeKey(path)}: ${text}` : text] : [];
  }

  return Object.entries(value).flatMap(([key, child]) => {
    if (metadataKeys.has(key)) return [];
    const nextPath = path || key === "errors" || key === "details" ? path : key;
    return collectFieldErrors(child, nextPath);
  });
}

/**
 * Turns API error envelopes into one reader-facing description without
 * discarding backend reasons or recovery guidance.
 */
export function formatApiError(payload: unknown, fallback: string) {
  if (!isRecord(payload)) return fallback;

  const primary =
    cleanText(payload.message) ??
    cleanText(payload.detail) ??
    cleanText(payload.error) ??
    fallback;
  const parts = [primary];

  const fieldErrors = [
    ...collectFieldErrors(payload.details),
    ...collectFieldErrors(payload.errors),
    ...collectFieldErrors(payload),
  ];
  for (const fieldError of fieldErrors) {
    if (!parts.some((part) => part.toLowerCase() === fieldError.toLowerCase())) {
      parts.push(fieldError);
    }
    if (parts.length >= 3) break;
  }

  const reason = cleanText(payload.reason);
  if (
    reason &&
    !primary.toLowerCase().includes(reason.toLowerCase().replaceAll("_", " "))
  ) {
    parts.push(`Reason: ${humanizeKey(reason)}.`);
  }

  const suggestedAction = cleanText(payload.suggested_action);
  if (suggestedAction) {
    parts.push(suggestedAction);
  } else if (payload.upgrade_required === true) {
    parts.push("Renew or upgrade your subscription to continue.");
  }

  return [...new Set(parts)].join(" ");
}
