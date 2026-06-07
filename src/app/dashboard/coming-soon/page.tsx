import { Rocket, Zap, Shield, Globe, Smartphone, BarChart3, Clock, CheckCircle } from "lucide-react";

export default function ComingSoonPage() {
  const features = [
    {
      icon: Smartphone,
      title: "Mobile App",
      description: "Manage your properties on the go with our iOS and Android apps",
      status: "Q3 2026",
    },
    {
      icon: Globe,
      title: "Multi-language Support",
      description: "Support for Hindi, Tamil, Telugu, and other regional languages",
      status: "Q2 2026",
    },
    {
      icon: BarChart3,
      title: "Advanced Analytics",
      description: "AI-powered insights and predictive analytics for better decisions",
      status: "Q4 2026",
    },
    {
      icon: Shield,
      title: "Enhanced Security",
      description: "Two-factor authentication and advanced security features",
      status: "Q2 2026",
    },
    {
      icon: Zap,
      title: "OTA Integrations",
      description: "Direct integration with Booking.com, Airbnb, and MakeMyTrip",
      status: "Q3 2026",
    },
    {
      icon: Clock,
      title: "Automated Check-in",
      description: "Self-service kiosks and digital key management",
      status: "Q4 2026",
    },
  ];

  return (
    <div className="space-y-8">
      <div className="text-center">
        <div className="inline-flex items-center justify-center h-20 w-20 rounded-2xl icon-bg-orange mb-6">
          <Rocket size={40} />
        </div>
        <h1 className="text-3xl font-bold text-slate-900">Coming Soon</h1>
        <p className="mt-2 text-slate-600 text-lg">
          Exciting features on the horizon
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((feature) => {
          const Icon = feature.icon;
          return (
            <div key={feature.title} className="card-premium p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="h-14 w-14 rounded-xl icon-bg-orange flex items-center justify-center">
                  <Icon size={28} />
                </div>
                <span className="text-xs font-bold text-orange-600 bg-orange-50 px-3 py-1.5 rounded-full">
                  {feature.status}
                </span>
              </div>
              <h3 className="text-xl font-bold text-slate-900">
                {feature.title}
              </h3>
              <p className="mt-3 text-slate-600">
                {feature.description}
              </p>
            </div>
          );
        })}
      </div>

      <div className="card p-8 bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-white/20 flex items-center justify-center">
            <CheckCircle size={28} />
          </div>
          <div>
            <h3 className="text-xl font-bold">Stay Updated</h3>
            <p className="text-orange-100 mt-1">
              Subscribe to our newsletter to get notified when new features launch
            </p>
          </div>
        </div>
        <div className="mt-6 flex gap-3">
          <input
            type="email"
            placeholder="Enter your email"
            className="flex-1 px-5 py-3 rounded-xl bg-white/20 border border-white/30 text-white placeholder-orange-200 focus:outline-none focus:ring-2 focus:ring-white/50"
          />
          <button className="px-8 py-3 bg-white text-orange-600 rounded-xl font-bold hover:bg-orange-50 transition-all shadow-md">
            Subscribe
          </button>
        </div>
      </div>
    </div>
  );
}
