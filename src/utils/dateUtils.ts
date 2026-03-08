/**
 * Date/time formatting utilities.
 *
 * All functions use the browser's local timezone automatically via the
 * Intl/toLocaleString APIs — no timezone parameter needed.
 *
 * Backend timestamps are stored and returned as UTC but without a timezone
 * indicator (e.g. "2026-03-07T22:00:00" instead of "2026-03-07T22:00:00Z").
 * ensureUtc() appends "Z" if missing so the Date constructor treats them
 * correctly as UTC before converting to local time.
 */

function ensureUtc(iso: string): string {
    return iso.endsWith("Z") || iso.includes("+") ? iso : iso + "Z";
  }
  
  /**
   * Format an ISO timestamp as a human-readable date+time.
   * e.g. "Mar 7, 3:45 PM"
   */
  export function formatDateTime(iso: string): string {
    return new Date(ensureUtc(iso)).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  }
  
  /**
   * Format an ISO timestamp as date only.
   * e.g. "Mar 7, 2026"
   */
  export function formatDate(iso: string): string {
    return new Date(ensureUtc(iso)).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    //   year: "numeric",
    });
  }
  
  /**
   * Format duration between two ISO timestamps.
   * e.g. "4.2s" or "850ms"
   */
  export function formatDuration(started: string, finished: string): string {
    const ms = new Date(ensureUtc(finished)).getTime() - new Date(ensureUtc(started)).getTime();
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  }