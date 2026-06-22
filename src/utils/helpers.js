/**
 * formatDate — format a date string or Firestore Timestamp to a readable string.
 * @param {Date | import("firebase/firestore").Timestamp | string | number} date
 * @param {Intl.DateTimeFormatOptions} [options]
 * @returns {string}
 */
export function formatDate(date, options = { month: "short", day: "numeric", year: "numeric" }) {
  if (!date) return "—";
  // Handle Firestore Timestamp
  const d = date?.toDate ? date.toDate() : new Date(date);
  return d.toLocaleDateString("en-US", options);
}

/**
 * formatRelativeTime — returns a human-readable relative time string.
 * @param {Date | import("firebase/firestore").Timestamp | string} date
 * @returns {string} e.g. "2 days ago", "just now"
 */
export function formatRelativeTime(date) {
  if (!date) return "—";
  const d = date?.toDate ? date.toDate() : new Date(date);
  const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
  const diff = (d.getTime() - Date.now()) / 1000;

  const thresholds = [
    { unit: "year", seconds: 31536000 },
    { unit: "month", seconds: 2592000 },
    { unit: "week", seconds: 604800 },
    { unit: "day", seconds: 86400 },
    { unit: "hour", seconds: 3600 },
    { unit: "minute", seconds: 60 },
  ];

  for (const { unit, seconds } of thresholds) {
    if (Math.abs(diff) >= seconds) {
      return rtf.format(Math.round(diff / seconds), unit);
    }
  }
  return "just now";
}

/**
 * truncate — shorten a string to maxLength with ellipsis.
 * @param {string} str
 * @param {number} maxLength
 * @returns {string}
 */
export function truncate(str, maxLength = 80) {
  if (!str || str.length <= maxLength) return str;
  return `${str.slice(0, maxLength)}…`;
}

/**
 * slugify — convert a string to a URL-safe slug.
 * @param {string} str
 * @returns {string}
 */
export function slugify(str) {
  return str
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * capitalize — capitalize the first letter of a string.
 * @param {string} str
 * @returns {string}
 */
export function capitalize(str) {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * clamp — clamp a number between min and max.
 * @param {number} value
 * @param {number} min
 * @param {number} max
 * @returns {number}
 */
export function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

/**
 * generateId — generate a short random alphanumeric ID.
 * @param {number} [length=8]
 * @returns {string}
 */
export function generateId(length = 8) {
  return Math.random().toString(36).substring(2, 2 + length);
}
