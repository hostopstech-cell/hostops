// ============================================================
// HostOps Pricing Table — Sirf yahan update karo
// monthly = per month | sixMonth = 5 months ka price (1 month free)
// ============================================================

export const PRICING_BY_DIAL: Record<string, {
  country: string; flag: string; currency: string;
  plans: { starter: { monthly: number; sixMonth: number };
           growth:  { monthly: number; sixMonth: number };
           business:{ monthly: number; sixMonth: number } }
}> = {
  "+91":  { country: "India",        flag: "🇮🇳", currency: "₹",
    plans: { starter: { monthly: 499,  sixMonth: 2495  }, growth: { monthly: 999,  sixMonth: 4995  }, business: { monthly: 2499, sixMonth: 12495 } } },
  "+1":   { country: "USA / Canada", flag: "🇺🇸", currency: "$",
    plans: { starter: { monthly: 19,   sixMonth: 95    }, growth: { monthly: 39,   sixMonth: 195   }, business: { monthly: 99,   sixMonth: 495   } } },
  "+44":  { country: "United Kingdom",flag: "🇬🇧", currency: "£",
    plans: { starter: { monthly: 15,   sixMonth: 75    }, growth: { monthly: 31,   sixMonth: 155   }, business: { monthly: 79,   sixMonth: 395   } } },
  "+971": { country: "UAE",           flag: "🇦🇪", currency: "AED ",
    plans: { starter: { monthly: 69,   sixMonth: 345   }, growth: { monthly: 139,  sixMonth: 695   }, business: { monthly: 359, sixMonth: 1795  } } },
  "+61":  { country: "Australia",     flag: "🇦🇺", currency: "A$",
    plans: { starter: { monthly: 29,   sixMonth: 145   }, growth: { monthly: 59,   sixMonth: 295   }, business: { monthly: 149, sixMonth: 745   } } },
  "+65":  { country: "Singapore",     flag: "🇸🇬", currency: "S$",
    plans: { starter: { monthly: 15,   sixMonth: 75    }, growth: { monthly: 35,   sixMonth: 175   }, business: { monthly: 89,  sixMonth: 445   } } },
  "+49":  { country: "Germany",       flag: "🇩🇪", currency: "€",
    plans: { starter: { monthly: 17,   sixMonth: 85    }, growth: { monthly: 35,   sixMonth: 175   }, business: { monthly: 89,  sixMonth: 445   } } },
  "+33":  { country: "France",        flag: "🇫🇷", currency: "€",
    plans: { starter: { monthly: 17,   sixMonth: 85    }, growth: { monthly: 35,   sixMonth: 175   }, business: { monthly: 89,  sixMonth: 445   } } },
  "+974": { country: "Qatar",         flag: "🇶🇦", currency: "QAR ",
    plans: { starter: { monthly: 69,   sixMonth: 345   }, growth: { monthly: 139,  sixMonth: 695   }, business: { monthly: 359, sixMonth: 1795  } } },
  "+966": { country: "Saudi Arabia",  flag: "🇸🇦", currency: "SAR ",
    plans: { starter: { monthly: 70,   sixMonth: 350   }, growth: { monthly: 145,  sixMonth: 725   }, business: { monthly: 365, sixMonth: 1825  } } },
  "default": { country: "International", flag: "🌍", currency: "$",
    plans: { starter: { monthly: 19,   sixMonth: 95    }, growth: { monthly: 39,   sixMonth: 195   }, business: { monthly: 99,  sixMonth: 495   } } },
};

// Helper: dial code se price string get karo
// getPrice("+91", "growth", "monthly") → "₹999"
export function getPrice(dialCode: string, plan: "starter" | "growth" | "business", billing: "monthly" | "sixMonth"): string {
  const region = PRICING_BY_DIAL[dialCode] || PRICING_BY_DIAL["default"];
  const amount = region.plans[plan][billing];
  return region.currency + amount.toLocaleString();
}

export function getSavings(dialCode: string, plan: "starter" | "growth" | "business"): string {
  const region = PRICING_BY_DIAL[dialCode] || PRICING_BY_DIAL["default"];
  const saved = region.plans[plan].monthly;
  return region.currency + saved.toLocaleString() + " savings (1 month free!)";
}

export function getCurrencyForDial(dialCode: string): string {
  return (PRICING_BY_DIAL[dialCode] || PRICING_BY_DIAL["default"]).currency;
}

// Legacy plans array — dashboard/subscription pages ke liye (wo INR use karte hain)
// Pricing page ab is array ko use NAHI karta
export const plans = [
  {
    name: "Starter", planKey: "starter", icon: "⚡",
    badge: "Flexible", badgeColor: "bg-slate-100 text-slate-600",
    desc: "Perfect for small properties",
    color: "border-slate-200", headerBg: "bg-slate-50",
    buttonStyle: "bg-slate-800 text-white hover:bg-slate-900",
    buttonText: "Get Started", popular: false,
    propertiesLimit: 1, staffLimit: 1,
    features: [
      { text: "1 Property", included: true },
      { text: "Booking Bot", included: true },
      { text: "Staff Access (1)", included: true },
      { text: "Basic Dashboard", included: true },
      { text: "Email Support", included: true },
      { text: "Revenue Reports", included: false },
      { text: "WhatsApp Integration", included: false },
      { text: "Priority Support", included: false },
    ],
  },
  {
    name: "Growth", planKey: "growth", icon: "🚀",
    badge: "Most Popular", badgeColor: "bg-orange-500 text-white",
    desc: "Best for growing businesses",
    color: "border-orange-500", headerBg: "bg-orange-50",
    buttonStyle: "bg-orange-600 text-white hover:bg-orange-700",
    buttonText: "Upgrade Now", popular: true,
    propertiesLimit: 5, staffLimit: 3,
    features: [
      { text: "5 Properties", included: true },
      { text: "Booking Bot", included: true },
      { text: "Staff Access (3)", included: true },
      { text: "Advanced Dashboard", included: true },
      { text: "Priority Support", included: true },
      { text: "Revenue Reports", included: true },
      { text: "WhatsApp Integration", included: true },
      { text: "Email Automation", included: true },
    ],
  },
  {
    name: "Business", planKey: "business", icon: "👑",
    badge: "Best Value", badgeColor: "bg-purple-600 text-white",
    desc: "For large scale operations",
    color: "border-purple-500", headerBg: "bg-purple-50",
    buttonStyle: "bg-purple-600 text-white hover:bg-purple-700",
    buttonText: "Get Business Plan", popular: false,
    propertiesLimit: 999, staffLimit: 999,
    features: [
      { text: "Unlimited Properties", included: true },
      { text: "Booking Bot", included: true },
      { text: "Unlimited Staff", included: true },
      { text: "Full Dashboard", included: true },
      { text: "24/7 Priority Support", included: true },
      { text: "Revenue Reports", included: true },
      { text: "WhatsApp Integration", included: true },
      { text: "Custom Integrations", included: true },
    ],
  },
];

export const PLAN_LIMITS: Record<string, { properties: number; staff: number }> = {
  trial:        { properties: 1, staff: 1 },
  starter:      { properties: 1, staff: 1 },
  growth:       { properties: 5, staff: 3 },
  business:     { properties: 999, staff: 999 },
  professional: { properties: 5, staff: 3 },
  enterprise:   { properties: 999, staff: 999 },
};
