import { Check, Crown, Sparkles, Zap } from "lucide-react";

export default function SubscriptionPage() {
  const plans = [
    {
      id: "starter",
      name: "Starter",
      price: "999",
      period: "month",
      icon: Sparkles,
      features: [
        "1 Property",
        "50 Beds",
        "Basic Dashboard",
        "Email Support",
        "Standard Reports",
      ],
      popular: false,
    },
    {
      id: "professional",
      name: "Professional",
      price: "2499",
      period: "month",
      icon: Zap,
      features: [
        "5 Properties",
        "250 Beds",
        "Advanced Dashboard",
        "Priority Support",
        "Custom Reports",
        "WhatsApp Integration",
        "Email Automation",
      ],
      popular: true,
    },
    {
      id: "enterprise",
      name: "Enterprise",
      price: "5999",
      period: "month",
      icon: Crown,
      features: [
        "Unlimited Properties",
        "Unlimited Beds",
        "White-label Solution",
        "24/7 Phone Support",
        "API Access",
        "Custom Integrations",
        "Dedicated Account Manager",
        "Advanced Analytics",
      ],
      popular: false,
    },
  ];

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-slate-900">Choose Your Plan</h1>
        <p className="mt-2 text-slate-600 text-lg">
          Select the plan that fits your business needs
        </p>
      </div>

      <div className="grid gap-8 sm:grid-cols-3">
        {plans.map((plan) => {
          const Icon = plan.icon;
          return (
            <div
              key={plan.id}
              className={`card-premium p-8 relative ${
                plan.popular
                  ? "border-orange-500 ring-2 ring-orange-500 shadow-lg"
                  : ""
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="bg-orange-500 text-white text-sm font-bold px-4 py-1.5 rounded-full shadow-md">
                    Most Popular
                  </span>
                </div>
              )}
              <div className="flex items-center justify-center mb-6">
                <div className="h-16 w-16 rounded-2xl icon-bg-orange flex items-center justify-center">
                  <Icon size={32} />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-slate-900 text-center">
                {plan.name}
              </h3>
              <div className="mt-6 text-center">
                <span className="text-4xl font-bold text-slate-900">₹{plan.price}</span>
                <span className="text-slate-500">/{plan.period}</span>
              </div>
              <ul className="mt-8 space-y-4">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-3 text-slate-600">
                    <Check size={20} className="text-emerald-500 flex-shrink-0" />
                    <span className="font-medium">{feature}</span>
                  </li>
                ))}
              </ul>
              <button
                className={`mt-8 w-full py-3 rounded-xl font-bold transition-all ${
                  plan.popular
                    ? "btn-primary shadow-md hover:shadow-lg"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                {plan.popular ? "Upgrade Now" : "Get Started"}
              </button>
            </div>
          );
        })}
      </div>

      <div className="card p-8 bg-gradient-to-br from-slate-50 to-white border-slate-200">
        <h3 className="text-lg font-bold text-slate-900 mb-2">Need a custom plan?</h3>
        <p className="text-slate-600">
          Contact us for enterprise solutions with custom pricing and features tailored to your specific needs.
        </p>
        <button className="mt-6 btn-secondary">Contact Sales</button>
      </div>
    </div>
  );
}
