import { MessageCircle, Clock, CheckCircle, XCircle, Bot, Users, Smartphone } from "lucide-react";

export default function WhatsAppPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">WhatsApp Integration</h1>
        <p className="mt-2 text-slate-600 text-lg">
          Automate guest communication via WhatsApp
        </p>
      </div>

      <div className="card p-8 bg-gradient-to-br from-blue-50 to-white border-blue-200">
        <div className="flex items-start gap-4">
          <div className="h-12 w-12 rounded-xl icon-bg-blue flex items-center justify-center flex-shrink-0">
            <MessageCircle size={24} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-blue-900">
              WhatsApp Integration Coming Soon
            </h3>
            <p className="mt-2 text-slate-700">
              WhatsApp bot functionality will be available in future updates.
              This will include automated booking confirmations, check-in reminders, and guest support.
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        {/* Owner Bot */}
        <div className="card-premium p-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="h-14 w-14 rounded-xl icon-bg-orange flex items-center justify-center">
              <Bot size={28} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900">Owner Bot</h3>
              <span className="inline-flex items-center gap-1 text-sm font-semibold text-orange-600">
                <Clock size={14} />
                Coming Soon
              </span>
            </div>
          </div>
          <p className="text-slate-600 mb-6">
            Manage your properties and bookings via WhatsApp commands
          </p>
          <div className="bg-slate-50 rounded-xl p-6">
            <h4 className="text-sm font-bold text-slate-900 mb-3">
              Preview Commands:
            </h4>
            <ul className="space-y-2 text-sm text-slate-600">
              <li className="font-mono text-xs bg-white px-3 py-2 rounded-lg border border-slate-200">/bookings - View all bookings</li>
              <li className="font-mono text-xs bg-white px-3 py-2 rounded-lg border border-slate-200">/checkin [code] - Check in guest</li>
              <li className="font-mono text-xs bg-white px-3 py-2 rounded-lg border border-slate-200">/checkout [code] - Check out guest</li>
              <li className="font-mono text-xs bg-white px-3 py-2 rounded-lg border border-slate-200">/revenue - View revenue stats</li>
              <li className="font-mono text-xs bg-white px-3 py-2 rounded-lg border border-slate-200">/occupancy - View occupancy rate</li>
            </ul>
          </div>
        </div>

        {/* Guest Bot */}
        <div className="card-premium p-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="h-14 w-14 rounded-xl icon-bg-green flex items-center justify-center">
              <Users size={28} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900">Guest Bot</h3>
              <span className="inline-flex items-center gap-1 text-sm font-semibold text-orange-600">
                <Clock size={14} />
                Coming Soon
              </span>
            </div>
          </div>
          <p className="text-slate-600 mb-6">
            Let guests interact with your property via WhatsApp
          </p>
          <div className="bg-slate-50 rounded-xl p-6">
            <h4 className="text-sm font-bold text-slate-900 mb-3">
              Preview Features:
            </h4>
            <ul className="space-y-2 text-sm text-slate-600">
              <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span>Booking inquiries</li>
              <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span>Room availability check</li>
              <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span>Price quotes</li>
              <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span>Booking confirmations</li>
              <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span>Check-in/out reminders</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Setup Instructions */}
      <div className="card-premium p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-12 w-12 rounded-xl icon-bg-blue flex items-center justify-center">
            <Smartphone size={24} />
          </div>
          <h3 className="text-xl font-bold text-slate-900">Setup Instructions</h3>
        </div>
        <div className="space-y-4">
          <div className="flex items-start gap-4">
            <div className="h-8 w-8 rounded-full icon-bg-orange flex items-center justify-center flex-shrink-0 text-sm font-bold text-white">
              1
            </div>
            <div>
              <p className="text-slate-700">
                Connect your WhatsApp Business account to HostOps
              </p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="h-8 w-8 rounded-full icon-bg-orange flex items-center justify-center flex-shrink-0 text-sm font-bold text-white">
              2
            </div>
            <div>
              <p className="text-slate-700">
                Configure bot commands and automated responses
              </p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="h-8 w-8 rounded-full icon-bg-orange flex items-center justify-center flex-shrink-0 text-sm font-bold text-white">
              3
            </div>
            <div>
              <p className="text-slate-700">
                Test the bot with sample messages
              </p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="h-8 w-8 rounded-full icon-bg-orange flex items-center justify-center flex-shrink-0 text-sm font-bold text-white">
              4
            </div>
            <div>
              <p className="text-slate-700">
                Go live and start automating guest communication
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Status */}
      <div className="grid gap-6 sm:grid-cols-2">
        <div className="card p-6 flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-red-100 flex items-center justify-center">
            <XCircle size={24} className="text-red-600" />
          </div>
          <div>
            <p className="font-bold text-slate-900">WhatsApp Business API</p>
            <p className="text-sm text-slate-500">Not Connected</p>
          </div>
        </div>
        <div className="card p-6 flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-red-100 flex items-center justify-center">
            <XCircle size={24} className="text-red-600" />
          </div>
          <div>
            <p className="font-bold text-slate-900">Webhook Configuration</p>
            <p className="text-sm text-slate-500">Not Configured</p>
          </div>
        </div>
      </div>
    </div>
  );
}
