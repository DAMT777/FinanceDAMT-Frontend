import { format, isToday, isYesterday } from "date-fns";
import { es } from "date-fns/locale";

export function formatTransactionDate(date: string): string {
  const d = new Date(date);
  if (isToday(d)) return "Today";
  if (isYesterday(d)) return "Yesterday";
  return format(d, "MMM d, yyyy", { locale: es });
}

export function formatTransactionTime(date: string): string {
  return format(new Date(date), "h:mm a");
}

export function formatSectionDate(date: string): string {
  const d = new Date(date);
  if (isToday(d)) return "Today";
  if (isYesterday(d)) return "Yesterday";
  return format(d, "EEEE, d 'de' MMMM", { locale: es });
}

export function formatDeadline(date: string): string {
  return format(new Date(date), "d MMM yyyy", { locale: es });
}

export function daysUntil(date: string): number {
  return Math.max(0, Math.ceil((new Date(date).getTime() - Date.now()) / 86_400_000));
}
