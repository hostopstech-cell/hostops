"use client";

import { useState } from "react";
import { Settings as SettingsIcon, User, Building2, Clock, Globe, Lock, Bell } from "lucide-react";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("general");

  const tabs = [
    { id: "general", label: "General", icon: Building2 },
    { id: "account", label: "Account", icon: User },
    { id: "notifications", label: "Notifications", icon: Bell },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Settings</h1>
        <p className="mt-2 text-slate-600 text-lg">
          Manage your account and application settings
        </p>
      </div>

      <div className="flex gap-8">
        {/* Sidebar */}
        <div className="w-64 space-y-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-5 py-3 rounded-xl transition-all ${
                  activeTab === tab.id
                    ? "bg-orange-500 text-white shadow-md"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <Icon size={20} />
                <span className="font-semibold">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="flex-1">
          {activeTab === "general" && (
            <div className="card-premium p-8">
              <h2 className="text-xl font-bold text-slate-900 mb-6">General Settings</h2>
              <div className="space-y-6">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Currency
                  </label>
                  <select className="input-field max-w-xs">
                    <option value="INR">Indian Rupee (₹)</option>
                    <option value="USD">US Dollar ($)</option>
                    <option value="EUR">Euro (€)</option>
                  </select>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Timezone
                  </label>
                  <select className="input-field max-w-xs">
                    <option value="Asia/Kolkata">Indian Standard Time (IST)</option>
                    <option value="UTC">UTC</option>
                  </select>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Language
                  </label>
                  <select className="input-field max-w-xs">
                    <option value="en">English</option>
                    <option value="hi">Hindi</option>
                  </select>
                </div>
                <div className="pt-6 border-t border-slate-100">
                  <p className="text-slate-500">
                    More settings coming soon
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === "account" && (
            <div className="card-premium p-8">
              <h2 className="text-xl font-bold text-slate-900 mb-6">Account Settings</h2>
              <div className="space-y-6">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Name
                  </label>
                  <input type="text" className="input-field max-w-xs" placeholder="Your name" />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Email
                  </label>
                  <input type="email" className="input-field max-w-xs" placeholder="your@email.com" />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    New Password
                  </label>
                  <input type="password" className="input-field max-w-xs" placeholder="••••••••" />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Confirm Password
                  </label>
                  <input type="password" className="input-field max-w-xs" placeholder="••••••••" />
                </div>
                <button className="btn-primary">Save Changes</button>
              </div>
            </div>
          )}

          {activeTab === "notifications" && (
            <div className="card-premium p-8">
              <h2 className="text-xl font-bold text-slate-900 mb-6">Notification Settings</h2>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold text-slate-900">Email Notifications</p>
                    <p className="text-slate-600">Receive booking confirmations via email</p>
                  </div>
                  <button className="w-14 h-7 bg-orange-500 rounded-full relative shadow-md">
                    <span className="absolute right-1 top-1 w-5 h-5 bg-white rounded-full" />
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold text-slate-900">SMS Notifications</p>
                    <p className="text-slate-600">Receive SMS alerts for important updates</p>
                  </div>
                  <button className="w-14 h-7 bg-slate-300 rounded-full relative">
                    <span className="absolute left-1 top-1 w-5 h-5 bg-white rounded-full" />
                  </button>
                </div>
                <div className="pt-6 border-t border-slate-100">
                  <p className="text-slate-500">
                    More notification settings coming soon
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
