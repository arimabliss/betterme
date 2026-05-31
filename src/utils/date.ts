/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Formats a given Date object (defaulting to current date/time) into a localized YYYY-MM-DD string.
 * This guarantees timezone-aligned date coordinates (e.g. IST, PST) rather than falling back to UTC.
 */
export function formatLocalDate(date: Date = new Date()): string {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

/**
 * Formats a local date to a readable string (e.g. "June 1, 2026")
 */
export function formatReadableLocalDate(dateStr: string): string {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString(undefined, { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
}
