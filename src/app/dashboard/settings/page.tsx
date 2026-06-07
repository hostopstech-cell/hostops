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
        <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
        <p className="mt-1 text-slate-600">
          Manage your account and application settings
        </p>
      </div>

      <div className="flex gap-6">
        {/* Sidebar */}
        <div className="w-64 space-y-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  activeTab === tab.id
                    ? "bg-orange-500 text-white"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <Icon size={18} />
                <span className="font-medium">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="flex-1">
          {activeTab === "general" && (
            <div className="card p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">General Settings</h2>
              <div className="space-y-6">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Currency
                  </label>
                  <select className="input-field max-w-xs">
                    <option value="INR">Indian Rupee (₹)</option>
                    <option value="USD">US Dollar ($)</option>
                    <option value="EUR">Euro (€)</option>
                  </select>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Timezone
                  </label>
                  <select className="input-field max-w-xs">
                    <option value="Asia/Kolkata">Indian Standard Time (IST)</option>
                    <option value="UTC">UTC</option>
                  </select>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Language
                  </label>
                  <select className="input-field max-w-xs">
                    <option value="en">English</option>
                    <option value="hi">Hindi</option>
                  </select>
                </div>
                <div className="pt-4 border-t border-slate-100">
                  <p className="text-sm text-slate-500">
                    More settings coming soon
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === "account" && (
            <div className="card p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Account Settings</h2>
              <div className="space-y-6">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Name
                  </label>
                  <input type="text" className="input-field max-w-xs" placeholder="Your name" />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Email
                  </label>
                  <input type="email" className="input-field max-w-xs" placeholder="your@email.com" />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    New Password
                  </label>
                  <input type="password" className="input-field max-w-xs" placeholder="••••••••" />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Confirm Password
                  </label>
                  <input type="password" className="input-field max-w-xs" placeholder="••••••••" />
                </div>
                <button className="btn-primary">Save Changes</button>
              </div>
            </div>
          )}

          {activeTab === "notifications" && (
            <div className="card p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Notification Settings</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-slate-900">Email Notifications</p>
                    <p className="text-sm text-slate-500">Receive booking confirmations via email</p>
                  </div>
                  <button className="w-12 h-6 bg-orange-500 rounded-full relative">
                    <span className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full" />
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-slate-900">SMS Notifications</p>
                    <p className="text-sm text-slate-500">Receive SMS alerts for important updates</p>
                  </div>
                  <button className="w-12 h-6 bg-slate-300 rounded-full relative">
                    <span className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full" />
                  </button>
                </div>
                <div className="pt-4 border-t border-slate-100">
                  <p className="text-sm text-slate-500">
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
