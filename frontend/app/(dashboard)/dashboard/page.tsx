"use client"

import { useEffect, useState } from "react"
import api from "@/lib/api"

const statCards = [
  {
    key: "totalItems",
    title: "Total Items",
    description: "Active inventory items",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>
    ),
    color: "bg-emerald-50 text-emerald-700 border-emerald-100",
    iconBg: "bg-emerald-100 text-emerald-600",
    badge: null,
  },
  {
    key: "lowStock",
    title: "Low Stock",
    description: "Below reorder threshold",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
      </svg>
    ),
    color: "bg-amber-50 text-amber-700 border-amber-100",
    iconBg: "bg-amber-100 text-amber-600",
    badge: { label: "Alert", className: "bg-amber-100 text-amber-700" },
  },
  {
    key: "outOfStock",
    title: "Out of Stock",
    description: "Needs immediate reorder",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    color: "bg-red-50 text-red-700 border-red-100",
    iconBg: "bg-red-100 text-red-600",
    badge: { label: "Critical", className: "bg-red-100 text-red-700" },
  },
  {
    key: "expiringSoon",
    title: "Expiring Soon",
    description: "Within next 7 days",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    color: "bg-orange-50 text-orange-700 border-orange-100",
    iconBg: "bg-orange-100 text-orange-600",
    badge: { label: "Urgent", className: "bg-orange-100 text-orange-700" },
  },
]

export default function DashboardPage() {
  const [stats, setStats] = useState({
    totalItems: 0,
    lowStock: 0,
    outOfStock: 0,
    expiringSoon: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchStats() {
      try {
        const [allItems, lowStock, expiring] = await Promise.all([
          api.get("/api/inventory/"),
          api.get("/api/inventory/filter/low-stock"),
          api.get("/api/inventory/filter/expiring-soon"),
        ])

        const outOfStock = allItems.data.filter(
          (i: any) => i.status === "out_of_stock"
        ).length

        setStats({
          totalItems: allItems.data.length,
          lowStock: lowStock.data.length,
          outOfStock,
          expiringSoon: expiring.data.length,
        })
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-3 border-emerald-500 border-t-transparent animate-spin" />
          <p className="text-emerald-600 text-sm font-medium">Fetching inventory...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-xs font-semibold text-emerald-600 uppercase tracking-widest">Live Overview</span>
          </div>
          <h2 className="text-2xl font-bold text-stone-900">Kitchen Dashboard</h2>
          <p className="text-stone-500 text-sm mt-1">
            Real-time snapshot of your restaurant inventory
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-medium text-emerald-700">Live</span>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <div
            key={card.key}
            className={`rounded-2xl border p-5 flex flex-col gap-4 ${card.color}`}
          >
            <div className="flex items-center justify-between">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${card.iconBg}`}>
                {card.icon}
              </div>
              {card.badge && (
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${card.badge.className}`}>
                  {card.badge.label}
                </span>
              )}
            </div>
            <div>
              <p className="text-3xl font-bold">{stats[card.key as keyof typeof stats]}</p>
              <p className="text-sm font-medium mt-0.5">{card.title}</p>
              <p className="text-xs opacity-70 mt-0.5">{card.description}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Quick tips banner */}
      <div className="rounded-2xl bg-linear-to-r from-emerald-900 to-green-800 p-6 flex items-center gap-5 text-white shadow-lg">
        <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center shrink-0">
          <svg className="w-6 h-6 text-emerald-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div>
          <p className="font-semibold text-white">Keep your kitchen fresh</p>
          <p className="text-emerald-200 text-sm mt-0.5">
            Review expiring items and low-stock alerts daily to reduce waste and avoid stockouts.
          </p>
        </div>
      </div>
    </div>
  )
}
