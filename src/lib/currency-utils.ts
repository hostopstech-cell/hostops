// Phone dial code → currency symbol mapping
// localStorage mein "hostops_dial_code" store hota hai after phone popup

export const DIAL_TO_CURRENCY: Record<string, string> = {
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

export function getCurrencySymbol(): string {
  if (typeof window === "undefined") return "₹";
  const dialCode = localStorage.getItem("hostops_dial_code");
  if (dialCode && DIAL_TO_CURRENCY[dialCode]) return DIAL_TO_CURRENCY[dialCode];
  // Legacy fallback
  const legacyMap: Record<string, string> = {
    INR: "₹", USD: "$", EUR: "€", GBP: "£",
    AED: "AED ", SGD: "S$", AUD: "A$", CAD: "C$",
  };
  return legacyMap[localStorage.getItem("hostops_currency") || "INR"] || "₹";
}

export function getDialCode(): string {
  if (typeof window === "undefined") return "+91";
  return localStorage.getItem("hostops_dial_code") || "+91";
}

export function setDialCode(dialCode: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem("hostops_dial_code", dialCode);
  // Legacy key bhi set karo for backward compat
  const currencyMap: Record<string, string> = {
    "+91": "INR", "+1": "USD", "+44": "GBP", "+971": "AED",
    "+61": "AUD", "+65": "SGD", "+49": "EUR", "+33": "EUR",
    "+974": "QAR", "+966": "SAR",
  };
  localStorage.setItem("hostops_currency", currencyMap[dialCode] || "USD");
}
