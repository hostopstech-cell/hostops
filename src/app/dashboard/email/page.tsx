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
        <h1 className="text-2xl font-bold text-slate-900">Email Automation</h1>
        <p className="mt-1 text-slate-600">
          Configure automated email templates for guest communication
        </p>
      </div>

      {/* Email Provider Status */}
      <div className="card p-6 bg-emerald-50 border-emerald-200">
        <div className="flex items-center gap-4">
          <CheckCircle className="h-6 w-6 text-emerald-600" />
          <div>
            <p className="font-semibold text-emerald-900">Brevo Connected</p>
            <p className="text-sm text-emerald-700">
              Email service is configured and ready to send automated emails
            </p>
          </div>
        </div>
      </div>

      {/* Email Templates */}
      <div className="card">
        <div className="border-b border-slate-100 px-6 py-4">
          <h2 className="text-lg font-semibold text-slate-900">Email Templates</h2>
        </div>
        <div className="divide-y divide-slate-100">
          {templates.map((template) => (
            <div key={template.id} className="p-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-lg bg-orange-100 flex items-center justify-center">
                  <Mail className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">{template.name}</h3>
                  <p className="text-sm text-slate-500">{template.description}</p>
                  <p className="text-xs text-slate-400 mt-1">{template.subject}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => toggleTemplate(template.id)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    template.enabled
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-slate-100 text-slate-600"
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
                  className="p-2 text-slate-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
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
      <div className="card p-6 bg-orange-50 border-orange-200">
        <div className="flex items-start gap-4">
          <Clock className="h-6 w-6 text-orange-600 flex-shrink-0 mt-1" />
          <div>
            <h3 className="font-semibold text-orange-900">
              Template Editor Coming Soon
            </h3>
            <p className="mt-1 text-sm text-orange-700">
              Custom email template editing will be available in future updates.
              For now, you can enable/disable templates and use the default templates.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
