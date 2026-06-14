// ============================================================
// country-config.ts — SINGLE SOURCE OF TRUTH
// Har dial code ke liye: currency, ID proof types, payment labels
// Property/Owner ke dial code se decide hota hai (guest country se nahi)
// ============================================================

export interface IdProofType {
  value: string;
  label: string;
  placeholder: string;   // e.g. "123456789012 (12 digits)"
  pattern?: string;       // regex for validation (frontend input pattern)
  validate?: (val: string) => string; // returns error message or ""
}

export interface CountryConfig {
  currencySymbol: string;
  currencyCode: string;
  idProofTypes: IdProofType[];
  paymentMethodLabel: string;     // e.g. "UPI ID", "PayPal Email", "Bank Account / IBAN"
  paymentFieldLabel: string;      // e.g. "UPI ID" (input label on Add Payment Details form)
  paymentFieldPlaceholder: string;
  paymentReferenceLabel: string;  // e.g. "UTR Number" -> "Transaction / Reference ID"
  paymentReferencePlaceholder: string;
}

const aadhaarValidate = (val: string) => {
  if (!val) return "";
  return /^\d{12}$/.test(val) ? "" : "Aadhaar must be exactly 12 digits";
};
const panValidate = (val: string) => {
  if (!val) return "";
  return /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(val) ? "" : "PAN format: ABCDE1234F";
};
const passportValidate = (val: string) => {
  if (!val) return "";
  return /^[A-Z][0-9]{7}$/.test(val) ? "" : "Passport format: A1234567 (varies by country)";
};
const genericMinLen = (min: number, label: string) => (val: string) => {
  if (!val) return "";
  return val.replace(/\s/g, "").length >= min ? "" : `${label} should be at least ${min} characters`;
};

// ── INDIA (+91) ─────────────────────────────────────────────
const INDIA: CountryConfig = {
  currencySymbol: "₹",
  currencyCode: "INR",
  idProofTypes: [
    { value: "aadhar", label: "Aadhaar Card", placeholder: "123456789012 (12 digits)", pattern: "\\d{12}", validate: aadhaarValidate },
    { value: "pan", label: "PAN Card", placeholder: "ABCDE1234F", pattern: "[A-Za-z]{5}[0-9]{4}[A-Za-z]{1}", validate: panValidate },
    { value: "passport", label: "Passport", placeholder: "A1234567", validate: passportValidate },
    { value: "driving_license", label: "Driving Licence", placeholder: "DL-1420110012345" },
    { value: "voter_id", label: "Voter ID", placeholder: "ABC1234567" },
  ],
  paymentMethodLabel: "UPI",
  paymentFieldLabel: "UPI ID",
  paymentFieldPlaceholder: "yourname@upi",
  paymentReferenceLabel: "UTR Number",
  paymentReferencePlaceholder: "123456789012 (12 digits)",
};

// ── USA (+1) ────────────────────────────────────────────────
const USA: CountryConfig = {
  currencySymbol: "$",
  currencyCode: "USD",
  idProofTypes: [
    { value: "drivers_license", label: "Driver's Licence", placeholder: "State ID number", validate: genericMinLen(5, "Driver's licence number") },
    { value: "passport", label: "Passport", placeholder: "A1234567", validate: passportValidate },
    { value: "state_id", label: "State ID Card", placeholder: "State ID number", validate: genericMinLen(5, "State ID number") },
    { value: "ssn", label: "SSN (last 4 digits)", placeholder: "1234", pattern: "\\d{4}", validate: (v) => v && !/^\d{4}$/.test(v) ? "Enter last 4 digits of SSN" : "" },
  ],
  paymentMethodLabel: "Bank Transfer / PayPal",
  paymentFieldLabel: "PayPal Email or Bank Details",
  paymentFieldPlaceholder: "you@paypal.com or account details",
  paymentReferenceLabel: "Transaction / Reference ID",
  paymentReferencePlaceholder: "Enter payment reference number",
};

// ── UK (+44) ────────────────────────────────────────────────
const UK: CountryConfig = {
  currencySymbol: "£",
  currencyCode: "GBP",
  idProofTypes: [
    { value: "passport", label: "Passport", placeholder: "A1234567", validate: passportValidate },
    { value: "drivers_license", label: "Driving Licence", placeholder: "Licence number", validate: genericMinLen(5, "Driving licence number") },
    { value: "national_id", label: "National ID Card", placeholder: "ID number", validate: genericMinLen(5, "ID number") },
  ],
  paymentMethodLabel: "Bank Transfer / PayPal",
  paymentFieldLabel: "PayPal Email or Bank (IBAN/Sort Code)",
  paymentFieldPlaceholder: "you@paypal.com or bank details",
  paymentReferenceLabel: "Transaction / Reference ID",
  paymentReferencePlaceholder: "Enter payment reference number",
};

// ── UAE (+971) ──────────────────────────────────────────────
const UAE: CountryConfig = {
  currencySymbol: "AED ",
  currencyCode: "AED",
  idProofTypes: [
    { value: "emirates_id", label: "Emirates ID", placeholder: "784-XXXX-XXXXXXX-X", validate: genericMinLen(10, "Emirates ID") },
    { value: "passport", label: "Passport", placeholder: "A1234567", validate: passportValidate },
    { value: "drivers_license", label: "Driving Licence", placeholder: "Licence number", validate: genericMinLen(5, "Driving licence number") },
  ],
  paymentMethodLabel: "Bank Transfer",
  paymentFieldLabel: "Bank Account / IBAN",
  paymentFieldPlaceholder: "AE12 0000 0000 0000 0000 000",
  paymentReferenceLabel: "Transaction / Reference ID",
  paymentReferencePlaceholder: "Enter payment reference number",
};

// ── AUSTRALIA (+61) ─────────────────────────────────────────
const AUSTRALIA: CountryConfig = {
  currencySymbol: "A$",
  currencyCode: "AUD",
  idProofTypes: [
    { value: "drivers_license", label: "Driver's Licence", placeholder: "Licence number", validate: genericMinLen(5, "Driver's licence number") },
    { value: "passport", label: "Passport", placeholder: "A1234567", validate: passportValidate },
    { value: "medicare", label: "Medicare Card", placeholder: "10 digit Medicare number", pattern: "\\d{10}", validate: (v) => v && !/^\d{10}$/.test(v) ? "Medicare number must be 10 digits" : "" },
  ],
  paymentMethodLabel: "Bank Transfer / PayPal",
  paymentFieldLabel: "PayPal Email or Bank (BSB + Account)",
  paymentFieldPlaceholder: "you@paypal.com or bank details",
  paymentReferenceLabel: "Transaction / Reference ID",
  paymentReferencePlaceholder: "Enter payment reference number",
};

// ── SINGAPORE (+65) ─────────────────────────────────────────
const SINGAPORE: CountryConfig = {
  currencySymbol: "S$",
  currencyCode: "SGD",
  idProofTypes: [
    { value: "nric_fin", label: "NRIC / FIN", placeholder: "S1234567A", validate: genericMinLen(9, "NRIC/FIN") },
    { value: "passport", label: "Passport", placeholder: "A1234567", validate: passportValidate },
    { value: "drivers_license", label: "Driving Licence", placeholder: "Licence number", validate: genericMinLen(5, "Driving licence number") },
  ],
  paymentMethodLabel: "PayNow / Bank Transfer",
  paymentFieldLabel: "PayNow ID or Bank Account",
  paymentFieldPlaceholder: "Mobile number or bank account details",
  paymentReferenceLabel: "Transaction / Reference ID",
  paymentReferencePlaceholder: "Enter payment reference number",
};

// ── GERMANY / FRANCE (+49 / +33, Euro) ──────────────────────
const EUROPE: CountryConfig = {
  currencySymbol: "€",
  currencyCode: "EUR",
  idProofTypes: [
    { value: "national_id", label: "National ID Card", placeholder: "ID number", validate: genericMinLen(5, "ID number") },
    { value: "passport", label: "Passport", placeholder: "A1234567", validate: passportValidate },
    { value: "drivers_license", label: "Driving Licence", placeholder: "Licence number", validate: genericMinLen(5, "Driving licence number") },
  ],
  paymentMethodLabel: "Bank Transfer (IBAN)",
  paymentFieldLabel: "IBAN / Bank Account",
  paymentFieldPlaceholder: "DE89 3704 0044 0532 0130 00",
  paymentReferenceLabel: "Transaction / Reference ID",
  paymentReferencePlaceholder: "Enter payment reference number",
};

// ── QATAR (+974) / SAUDI ARABIA (+966) ───────────────────────
const QATAR: CountryConfig = {
  currencySymbol: "QAR ",
  currencyCode: "QAR",
  idProofTypes: [
    { value: "qid", label: "Qatar ID (QID)", placeholder: "QID number", validate: genericMinLen(5, "QID") },
    { value: "passport", label: "Passport", placeholder: "A1234567", validate: passportValidate },
    { value: "drivers_license", label: "Driving Licence", placeholder: "Licence number", validate: genericMinLen(5, "Driving licence number") },
  ],
  paymentMethodLabel: "Bank Transfer",
  paymentFieldLabel: "Bank Account / IBAN",
  paymentFieldPlaceholder: "QA00 0000 0000 0000 0000 0000 00",
  paymentReferenceLabel: "Transaction / Reference ID",
  paymentReferencePlaceholder: "Enter payment reference number",
};

const SAUDI: CountryConfig = {
  currencySymbol: "SAR ",
  currencyCode: "SAR",
  idProofTypes: [
    { value: "national_id", label: "National ID / Iqama", placeholder: "ID number", validate: genericMinLen(5, "ID number") },
    { value: "passport", label: "Passport", placeholder: "A1234567", validate: passportValidate },
    { value: "drivers_license", label: "Driving Licence", placeholder: "Licence number", validate: genericMinLen(5, "Driving licence number") },
  ],
  paymentMethodLabel: "Bank Transfer",
  paymentFieldLabel: "Bank Account / IBAN",
  paymentFieldPlaceholder: "SA00 0000 0000 0000 0000 0000",
  paymentReferenceLabel: "Transaction / Reference ID",
  paymentReferencePlaceholder: "Enter payment reference number",
};

// ── CANADA (+1 overlaps with USA, default to USA config) ────
// Note: +1 is shared by USA/Canada; we default to USA config

// ── DIAL CODE → CONFIG MAP ───────────────────────────────────
export const COUNTRY_CONFIG: Record<string, CountryConfig> = {
  "+91": INDIA,
  "+1": USA,
  "+44": UK,
  "+971": UAE,
  "+61": AUSTRALIA,
  "+65": SINGAPORE,
  "+49": EUROPE,
  "+33": EUROPE,
  "+974": QATAR,
  "+966": SAUDI,
};

export function getCountryConfig(dialCode: string | null | undefined): CountryConfig {
  if (dialCode === "USD_DEFAULT" || dialCode === "other") dialCode = "+1";
  return COUNTRY_CONFIG[dialCode || "+91"] || INDIA;
}
