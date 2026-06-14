// ============================================================
// currency-utils.ts — SINGLE SOURCE OF TRUTH
// Dial code = currency ka authority. Koi conversion nahi.
// ============================================================

const DIAL_TO_SYMBOL: Record<string, string> = {
  "+91":  "₹",
  "+1":   "$",
  "+44":  "£",
  "+971": "AED ",
  "+61":  "A$",
  "+65":  "S$",
  "+49":  "€",
  "+33":  "€",
  "+974": "QAR ",
  "+966": "SAR ",
};

export function getDialCode(): string {
  if (typeof window === "undefined") return "+91";
  return localStorage.getItem("hostops_dial_code") || "+91";
}

export function setDialCode(dialCode: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem("hostops_dial_code", dialCode);
  const currencyMap: Record<string, string> = {
    "+91": "INR", "+1": "USD", "+44": "GBP", "+971": "AED",
    "+61": "AUD", "+65": "SGD", "+49": "EUR", "+33": "EUR",
    "+974": "QAR", "+966": "SAR",
  };
  localStorage.setItem("hostops_currency", currencyMap[dialCode] || "USD");
}

export function getCurrencySymbol(): string {
  if (typeof window === "undefined") return "₹";
  return DIAL_TO_SYMBOL[getDialCode()] || "₹";
}

export const getDisplayCurrencySymbol = getCurrencySymbol;
export function getDisplayCurrency(): string { return "INR"; }
export function setDisplayCurrency(_: string): void {}
export function getLanguage(): string {
  if (typeof window === "undefined") return "en";
  return localStorage.getItem("hostops_language") || "en";
}
export function setLanguage(lang: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem("hostops_language", lang);
}
export const DIAL_TO_CURRENCY = DIAL_TO_SYMBOL;
