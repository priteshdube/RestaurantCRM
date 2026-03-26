"use client"

import { useEffect, useState } from "react"
import api from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

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

  const cards = [
    {
      title: "Total Items",
      value: stats.totalItems,
      description: "Active inventory items",
      badge: null,
    },
    {
      title: "Low Stock",
      value: stats.lowStock,
      description: "Below reorder threshold",
      badge: "warning",
    },
    {
      title: "Out of Stock",
      value: stats.outOfStock,
      description: "Needs immediate reorder",
      badge: "destructive",
    },
    {
      title: "Expiring Soon",
      value: stats.expiringSoon,
      description: "Within next 7 days",
      badge: "warning",
    },
  ]

  if (loading) return <p className="text-gray-500">Loading dashboard...</p>

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
        <p className="text-gray-500 text-sm mt-1">
          Overview of your restaurant inventory
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card) => (
          <Card key={card.title}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">
                {card.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <p className="text-3xl font-bold">{card.value}</p>
                {card.badge && (
                  <Badge variant={card.badge as any}>
                    {card.badge === "destructive" ? "Critical" : "Alert"}
                  </Badge>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-1">{card.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}