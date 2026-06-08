"use client";

import { useState } from "react";
import { Mail, Check, X, Edit, Clock, CheckCircle } from "lucide-react";

export default function EmailAutomationPage() {
  const [templates, setTemplates] = useState([
    {
      id: 1,
      name: "Booking Confirmation",
      subject: "Booking Confirmed - {{property_name}}",
      enabled: true,
      description: "Sent when a booking is confirmed",
    },
    {
      id: 2,
      name: "Check-in Reminder",
      subject: "Check-in Reminder - {{property_name}}",
      enabled: true,
      description: "Sent 24 hours before check-in",
    },
    {
      id: 3,
      name: "Check-out Reminder",
      subject: "Check-out Reminder - {{property_name}}",
      enabled: true,
      description: "Sent on the day of check-out",
    },
    {
      id: 4,
      name: "Review Request",
      subject: "How was your stay at {{property_name}}?",
      enabled: false,
      description: "Sent after check-out",
    },
  ]);

  function toggleTemplate(id: number) {
    setTemplates(templates.map(t => 
      t.id === id ? { ...t, enabled: !t.enabled } : t
    ));
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Email Automation</h1>
        <p className="mt-2 text-slate-600 text-lg">
          Configure automated email templates for guest communication
        </p>
      </div>

      {/* Email Provider Status */}
      <div className="card p-8 bg-gradient-to-br from-emerald-50 to-white border-emerald-200">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl icon-bg-green flex items-center justify-center">
            <CheckCircle size={24} />
          </div>
          <div>
            <p className="text-lg font-bold text-emerald-900">Brevo Connected</p>
            <p className="text-slate-700">
              Email service is configured and ready to send automated emails
            </p>
          </div>
        </div>
      </div>

      {/* Email Templates */}
      <div className="card-premium">
        <div className="border-b border-slate-100 px-8 py-6">
          <h2 className="text-xl font-bold text-slate-900">Email Templates</h2>
        </div>
        <div className="divide-y divide-slate-100">
          {templates.map((template) => (
            <div key={template.id} className="p-8 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-xl icon-bg-orange flex items-center justify-center">
                  <Mail size={28} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">{template.name}</h3>
                  <p className="text-slate-600 mt-1">{template.description}</p>
                  <p className="text-xs text-slate-400 mt-2 font-mono">{template.subject}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => toggleTemplate(template.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                    template.enabled
                      ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {template.enabled ? (
                    <>
                      <Check size={16} />
                      Enabled
                    </>
                  ) : (
                    <>
                      <X size={16} />
                      Disabled
                    </>
                  )}
                </button>
                <button
                  className="p-2 text-slate-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-all"
                  title="Edit Template"
                >
                  <Edit size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Coming Soon Notice */}
      <div className="card p-8 bg-gradient-to-br from-orange-50 to-white border-orange-200">
        <div className="flex items-start gap-4">
          <div className="h-12 w-12 rounded-xl icon-bg-orange flex items-center justify-center flex-shrink-0">
            <Clock size={24} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-orange-900">
              Template Editor Coming Soon
            </h3>
            <p className="mt-2 text-slate-700">
              Custom email template editing will be available in future updates.
              For now, you can enable/disable templates and use the default templates.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
