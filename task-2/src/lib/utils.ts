import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(dateStr: string, timezone?: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: timezone || "UTC",
  });
}

export function formatTime(dateStr: string, timezone?: string): string {
  const d = new Date(dateStr);
  return d.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    timeZone: timezone || "UTC",
  });
}

export function formatDateTime(dateStr: string, timezone?: string): string {
  return `${formatDate(dateStr, timezone)} at ${formatTime(dateStr, timezone)}`;
}

export function isPast(dateStr: string): boolean {
  return new Date(dateStr) < new Date();
}

export function generateICS(event: { title: string; description?: string | null; start_time: string; end_time: string; venue_address?: string | null; online_link?: string | null }): string {
  const fmt = (d: string) => new Date(d).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//EventPass//EN",
    "BEGIN:VEVENT",
    `DTSTART:${fmt(event.start_time)}`,
    `DTEND:${fmt(event.end_time)}`,
    `SUMMARY:${event.title}`,
    `DESCRIPTION:${event.description || ""}`,
    `LOCATION:${event.venue_address || event.online_link || ""}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ];
  return lines.join("\r\n");
}

export function downloadICS(event: Parameters<typeof generateICS>[0]) {
  const ics = generateICS(event);
  const blob = new Blob([ics], { type: "text/calendar" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${event.title.replace(/\s+/g, "-")}.ics`;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportCSV(filename: string, headers: string[], rows: string[][]) {
  const BOM = "\uFEFF";
  const csv = BOM + [headers.join(","), ...rows.map(r => r.map(c => `"${(c || "").replace(/"/g, '""')}"`).join(","))].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
