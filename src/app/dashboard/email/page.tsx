"use client";

import { Mail, Lock, Edit } from "lucide-react";

const templates = [
  {
    id: "booking-confirmation",
    title: "Booking Confirmation",
    description: "Sent when a booking is confirmed",
    subject: "Booking Confirmed - {{property_name}}",
  },
  {
    id: "checkin-reminder",
    title: "Check-in Reminder",
    description: "Sent 24 hours before check-in",
    subject: "Check-in Reminder - {{property_name}}",
  },
  {
    id: "checkout-reminder",
    title: "Check-out Reminder",
    description: "Sent on the day of check-out",
    subject: "Check-out Reminder - {{property_name}}",
  },
  {
    id: "review-request",
    title: "Review Request",
    description: "Sent after check-out",
    subject: "How was your stay at {{property_name}}?",
  },
];

export default function EmailAutomationPage() {
  return (
    <div className="min-h-screen bg-white p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Email Automation</h1>
        <p className="text-gray-500 mt-1">
          Configure automated email templates for guest communication
        </p>
      </div>

      {/* Coming Soon Banner */}
      <div className="mb-8 rounded-2xl bg-orange-50 border border-orange-100 p-5 flex items-center gap-4">
        <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center shrink-0">
          <Lock className="w-5 h-5 text-orange-400" />
        </div>
        <div>
          <p className="font-semibold text-orange-500 text-sm">Coming Soon</p>
          <p className="text-sm text-gray-500 mt-0.5">
            Email automation feature is coming soon. You will be able to create,
            customize and automate email templates.
          </p>
        </div>
      </div>

      {/* Email Templates */}
      <div className="border border-gray-200 rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900 text-lg">Email Templates</h2>
        </div>

        <div className="divide-y divide-gray-100">
          {templates.map((template) => (
            <div
              key={template.id}
              className="flex items-center gap-4 px-6 py-5"
            >
              {/* Mail icon */}
              <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center shrink-0">
                <Mail className="w-5 h-5 text-orange-400" />
              </div>

              {/* Text */}
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 text-sm">
                  {template.title}
                </p>
                <p className="text-sm text-gray-500">{template.description}</p>
                <p className="text-xs text-gray-400 mt-0.5 font-mono">
                  {template.subject}
                </p>
              </div>

              {/* Coming Soon lock */}
              <div className="flex items-center gap-3 shrink-0">
                <div className="flex flex-col items-center gap-1">
                  <div className="w-10 h-10 bg-orange-50 rounded-full flex items-center justify-center">
                    <Lock className="w-4 h-4 text-orange-400" />
                  </div>
                  <span className="text-xs text-gray-400">Coming Soon</span>
                </div>

                <button
                  disabled
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 bg-gray-50 text-gray-400 text-xs cursor-not-allowed"
                >
                  <Lock className="w-3 h-3" />
                  Coming Soon
                </button>

                <button
                  disabled
                  className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 bg-gray-50 text-gray-300 cursor-not-allowed"
                >
                  <Edit className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Template Editor Coming Soon */}
      <div className="mt-6 rounded-2xl bg-orange-50 border border-orange-100 p-5 flex items-center gap-4">
        <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center shrink-0">
          <Lock className="w-5 h-5 text-orange-400" />
        </div>
        <div>
          <p className="font-semibold text-orange-500 text-sm">
            Template Editor Coming Soon
          </p>
          <p className="text-sm text-gray-500 mt-0.5">
            Custom email template editing will be available in future updates.
            For now, you can enable/disable templates and use the default
            templates.
          </p>
        </div>
      </div>
    </div>
  );
}