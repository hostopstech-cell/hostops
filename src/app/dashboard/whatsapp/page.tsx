import { MessageCircle, Clock, CheckCircle, XCircle, Bot, Users, Smartphone } from "lucide-react";

export default function WhatsAppPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">WhatsApp Integration</h1>
        <p className="mt-1 text-slate-600">
          Automate guest communication via WhatsApp
        </p>
      </div>

      <div className="card p-6 bg-blue-50 border-blue-200">
        <div className="flex items-start gap-4">
          <MessageCircle className="h-6 w-6 text-blue-600 flex-shrink-0 mt-1" />
          <div>
            <h3 className="font-semibold text-blue-900">
              WhatsApp Integration Coming Soon
            </h3>
            <p className="mt-1 text-sm text-blue-700">
              WhatsApp bot functionality will be available in future updates.
              This will include automated booking confirmations, check-in reminders, and guest support.
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        {/* Owner Bot */}
        <div className="card p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-12 w-12 rounded-lg bg-orange-100 flex items-center justify-center">
              <Bot className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Owner Bot</h3>
              <span className="inline-flex items-center gap-1 text-sm text-yellow-600">
                <Clock size={14} />
                Coming Soon
              </span>
            </div>
          </div>
          <p className="text-sm text-slate-600 mb-4">
            Manage your properties and bookings via WhatsApp commands
          </p>
          <div className="bg-slate-50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-slate-900 mb-2">
              Preview Commands:
            </h4>
            <ul className="space-y-1 text-sm text-slate-600">
              <li className="font-mono text-xs">/bookings - View all bookings</li>
              <li className="font-mono text-xs">/checkin [code] - Check in guest</li>
              <li className="font-mono text-xs">/checkout [code] - Check out guest</li>
              <li className="font-mono text-xs">/revenue - View revenue stats</li>
              <li className="font-mono text-xs">/occupancy - View occupancy rate</li>
            </ul>
          </div>
        </div>

        {/* Guest Bot */}
        <div className="card p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-12 w-12 rounded-lg bg-green-100 flex items-center justify-center">
              <Users className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Guest Bot</h3>
              <span className="inline-flex items-center gap-1 text-sm text-yellow-600">
                <Clock size={14} />
                Coming Soon
              </span>
            </div>
          </div>
          <p className="text-sm text-slate-600 mb-4">
            Let guests interact with your property via WhatsApp
          </p>
          <div className="bg-slate-50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-slate-900 mb-2">
              Preview Features:
            </h4>
            <ul className="space-y-1 text-sm text-slate-600">
              <li>• Booking inquiries</li>
              <li>• Room availability check</li>
              <li>• Price quotes</li>
              <li>• Booking confirmations</li>
              <li>• Check-in/out reminders</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Setup Instructions */}
      <div className="card p-6">
        <div className="flex items-center gap-3 mb-4">
          <Smartphone className="h-6 w-6 text-slate-600" />
          <h3 className="text-lg font-semibold text-slate-900">Setup Instructions</h3>
        </div>
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="h-6 w-6 rounded-full bg-slate-200 flex items-center justify-center flex-shrink-0 text-sm font-medium text-slate-600">
              1
            </div>
            <div>
              <p className="text-sm text-slate-700">
                Connect your WhatsApp Business account to HostOps
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="h-6 w-6 rounded-full bg-slate-200 flex items-center justify-center flex-shrink-0 text-sm font-medium text-slate-600">
              2
            </div>
            <div>
              <p className="text-sm text-slate-700">
                Configure bot commands and automated responses
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="h-6 w-6 rounded-full bg-slate-200 flex items-center justify-center flex-shrink-0 text-sm font-medium text-slate-600">
              3
            </div>
            <div>
              <p className="text-sm text-slate-700">
                Test the bot with sample messages
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="h-6 w-6 rounded-full bg-slate-200 flex items-center justify-center flex-shrink-0 text-sm font-medium text-slate-600">
              4
            </div>
            <div>
              <p className="text-sm text-slate-700">
                Go live and start automating guest communication
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Status */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="card p-4 flex items-center gap-4">
          <XCircle className="h-8 w-8 text-red-500" />
          <div>
            <p className="font-medium text-slate-900">WhatsApp Business API</p>
            <p className="text-sm text-slate-500">Not Connected</p>
          </div>
        </div>
        <div className="card p-4 flex items-center gap-4">
          <XCircle className="h-8 w-8 text-red-500" />
          <div>
            <p className="font-medium text-slate-900">Webhook Configuration</p>
            <p className="text-sm text-slate-500">Not Configured</p>
          </div>
        </div>
      </div>
    </div>
  );
}
