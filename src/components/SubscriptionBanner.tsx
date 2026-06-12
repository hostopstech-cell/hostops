'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { X, Clock, AlertTriangle, Zap, Shield } from 'lucide-react'

export default function SubscriptionBanner() {
  const router = useRouter()
  const [subData, setSubData] = useState<any>(null)
  const [dismissed, setDismissed] = useState(false)
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 })

  useEffect(() => {
    fetch('/api/subscription').then(r => r.json()).then(setSubData).catch(() => {})
  }, [])

  useEffect(() => {
    if (!subData?.trialEndsAt || !subData?.isOnTrial) return
    const calc = () => {
      const diff = new Date(subData.trialEndsAt).getTime() - Date.now()
      if (diff <= 0) return setTimeLeft({ hours: 0, minutes: 0, seconds: 0 })
      setTimeLeft({
        hours: Math.floor(diff / (1000*60*60)),
        minutes: Math.floor((diff / (1000*60)) % 60),
        seconds: Math.floor((diff / 1000) % 60),
      })
    }
    calc()
    const t = setInterval(calc, 1000)
    return () => clearInterval(t)
  }, [subData])

  if (!subData || dismissed) return null

  // State 1: Trial active — only show if last few hours or dismissed
  if (subData.isOnTrial && !subData.trialExpired) {
    const hoursLeft = subData.trialHoursLeft || timeLeft.hours
    if (hoursLeft > 6) return null // Don't bother showing if > 6 hours left

    return (
      <div className="mx-4 md:mx-6 mb-4 bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3 flex items-center gap-3 shadow-sm">
        <div className="w-8 h-8 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
          <Clock size={15} className="text-amber-600" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-amber-900">
            ⏰ Your free trial ends in{' '}
            <span className="font-bold text-amber-700 tabular-nums">
              {String(timeLeft.hours).padStart(2,'0')}:{String(timeLeft.minutes).padStart(2,'0')}:{String(timeLeft.seconds).padStart(2,'0')}
            </span>
          </p>
          <p className="text-xs text-amber-600 mt-0.5">Subscribe now to keep access to all your data and features.</p>
        </div>
        <button onClick={() => router.push('/dashboard/subscription')}
          className="flex-shrink-0 bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors">
          Subscribe
        </button>
        <button onClick={() => setDismissed(true)} className="text-amber-400 hover:text-amber-600 flex-shrink-0">
          <X size={14} />
        </button>
      </div>
    )
  }

  // State 2: Grace period (paid plan expired, 2 days extra)
  if (subData.inGracePeriod) {
    return (
      <div className="mx-4 md:mx-6 mb-4 bg-red-50 border border-red-200 rounded-2xl px-4 py-3 flex items-center gap-3 shadow-sm">
        <div className="w-8 h-8 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
          <AlertTriangle size={15} className="text-red-600" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-red-900">
            🚨 Your subscription has expired — <span className="text-red-700">2-day grace period active</span>
          </p>
          <p className="text-xs text-red-600 mt-0.5">Renew now to avoid losing access. Bookings & chatbot are still working temporarily.</p>
        </div>
        <button onClick={() => router.push('/dashboard/subscription')}
          className="flex-shrink-0 bg-red-500 hover:bg-red-600 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap">
          Renew Now
        </button>
      </div>
    )
  }

  // State 3: Subscription expiring in last 3 days
  if (subData.subExpiringSoon && subData.subscriptionActive) {
    return (
      <div className="mx-4 md:mx-6 mb-4 bg-orange-50 border border-orange-200 rounded-2xl px-4 py-3 flex items-center gap-3 shadow-sm">
        <div className="w-8 h-8 bg-orange-100 rounded-xl flex items-center justify-center flex-shrink-0">
          <Zap size={15} className="text-orange-600" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-orange-900">
            ⚡ Your {subData.plan} plan expires in <span className="text-orange-700 font-bold">{subData.subDaysLeft} day{subData.subDaysLeft !== 1 ? 's' : ''}</span>
          </p>
          <p className="text-xs text-orange-600 mt-0.5">Renew early to enjoy uninterrupted service. Your data is always safe.</p>
        </div>
        <button onClick={() => router.push('/dashboard/subscription')}
          className="flex-shrink-0 bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap">
          Renew Plan
        </button>
        <button onClick={() => setDismissed(true)} className="text-orange-400 hover:text-orange-600 flex-shrink-0">
          <X size={14} />
        </button>
      </div>
    )
  }

  // State 4: Active subscription — show shield (subtle, dismissible)
  if (subData.subscriptionActive && !subData.subExpiringSoon && !dismissed) {
    const renewDate = subData.subscriptionEndsAt
      ? new Date(subData.subscriptionEndsAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
      : null
    if (!renewDate) return null
    return (
      <div className="mx-4 md:mx-6 mb-4 bg-emerald-50 border border-emerald-200 rounded-2xl px-4 py-2.5 flex items-center gap-3">
        <Shield size={14} className="text-emerald-600 flex-shrink-0" />
        <p className="text-xs text-emerald-700 flex-1">
          <span className="font-semibold capitalize">{subData.plan} plan</span> active · Renews on {renewDate}
        </p>
        <button onClick={() => setDismissed(true)} className="text-emerald-400 hover:text-emerald-600">
          <X size={13} />
        </button>
      </div>
    )
  }

  return null
}
