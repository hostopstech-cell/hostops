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
        <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-orange-100 mb-4">
          <Rocket className="h-8 w-8 text-orange-600" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900">Coming Soon</h1>
        <p className="mt-1 text-slate-600">
          Exciting features on the horizon
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((feature) => {
          const Icon = feature.icon;
          return (
            <div key={feature.title} className="card p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="h-12 w-12 rounded-lg bg-orange-100 flex items-center justify-center">
                  <Icon className="h-6 w-6 text-orange-600" />
                </div>
                <span className="text-xs font-medium text-orange-600 bg-orange-50 px-2 py-1 rounded-full">
                  {feature.status}
                </span>
              </div>
              <h3 className="text-lg font-semibold text-slate-900">
                {feature.title}
              </h3>
              <p className="mt-2 text-sm text-slate-600">
                {feature.description}
              </p>
            </div>
          );
        })}
      </div>

      <div className="card p-6 bg-gradient-to-r from-orange-500 to-orange-600 text-white">
        <div className="flex items-center gap-4">
          <CheckCircle className="h-8 w-8" />
          <div>
            <h3 className="font-semibold text-lg">Stay Updated</h3>
            <p className="text-orange-100 text-sm mt-1">
              Subscribe to our newsletter to get notified when new features launch
            </p>
          </div>
        </div>
        <div className="mt-4 flex gap-3">
          <input
            type="email"
            placeholder="Enter your email"
            className="flex-1 px-4 py-2 rounded-lg bg-white/20 border border-white/30 text-white placeholder-orange-200 focus:outline-none focus:ring-2 focus:ring-white/50"
          />
          <button className="px-6 py-2 bg-white text-orange-600 rounded-lg font-medium hover:bg-orange-50 transition-colors">
            Subscribe
          </button>
        </div>
      </div>
    </div>
  );
}
