export function formatMoney(amount: number, currency = "UZS"): string {
  return new Intl.NumberFormat("ru-RU", {
    style: "decimal",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount) + " " + currency;
}

// "1 500 000" formatida (valyutasiz, input display uchun)
export function formatNumberDisplay(value: string | number): string {
  const num = typeof value === "string" ? value.replace(/\D/g, "") : String(Math.floor(value));
  if (!num) return "";
  return new Intl.NumberFormat("ru-RU").format(Number(num));
}

// Faqat raqamlarni qaytaradi (saqlash uchun)
export function parseNumber(formatted: string): number {
  return Number(formatted.replace(/\D/g, "")) || 0;
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return new Intl.DateTimeFormat("uz-UZ", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

export function formatShortDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days === 0) return "Bugun";
  if (days === 1) return "Kecha";
  if (days < 7) return `${days} kun oldin`;

  return new Intl.DateTimeFormat("uz-UZ", {
    day: "2-digit",
    month: "short",
  }).format(date);
}

export const MONTH_NAMES = [
  "Yanvar", "Fevral", "Mart", "Aprel", "May", "Iyun",
  "Iyul", "Avgust", "Sentabr", "Oktabr", "Noyabr", "Dekabr",
];
