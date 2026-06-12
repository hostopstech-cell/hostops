export const CURRENCY_SYMBOLS: Record<string, string> = {
  INR: "₹", USD: "$", EUR: "€", GBP: "£",
  AED: "د.إ", SGD: "S$", AUD: "A$", CAD: "C$", JPY: "¥", THB: "฿",
};

export function getCurrencySymbol(): string {
  if (typeof window === "undefined") return "₹";
  return CURRENCY_SYMBOLS[localStorage.getItem("hostops_currency") || "INR"] || "₹";
}
