"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import api from "@/lib/api"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { AlertTriangle, PackageX, TrendingDown, Clock } from "lucide-react"

type Item = {
  id: string
  name: string
  sku: string
  quantity: number
  reorder_threshold: number
  unit: string
  cost_per_unit: number
  expiry_date: string
  status: string
  categories: { name: string } | null
  suppliers: { name: string } | null
}

export default function AlertsPage() {
  const router = useRouter()
  const [lowStock, setLowStock] = useState<Item[]>([])
  const [expiring, setExpiring] = useState<Item[]>([])
  const [outOfStock, setOutOfStock] = useState<Item[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAlerts()
  }, [])

  async function fetchAlerts() {
    try {
      const [lowRes, expRes, allRes] = await Promise.all([
        api.get("/api/inventory/filter/low-stock"),
        api.get("/api/inventory/filter/expiring-soon"),
        api.get("/api/inventory/"),
      ])
      setLowStock(lowRes.data)
      setExpiring(expRes.data)
      setOutOfStock(allRes.data.filter((i: Item) => i.status === "out_of_stock"))
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-stone-500 py-10">
        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
        </svg>
        Loading alerts...
      </div>
    )
  }

  const totalAlerts = lowStock.length + expiring.length + outOfStock.length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
          <span className="text-xs font-semibold text-emerald-600 uppercase tracking-widest">
            Overview
          </span>
        </div>
        <h2 className="text-2xl font-bold text-stone-900">Alerts</h2>
        <p className="text-sm text-stone-400 mt-0.5">
          {totalAlerts === 0
            ? "All items are looking good"
            : `${totalAlerts} item${totalAlerts !== 1 ? "s" : ""} need attention`}
        </p>
      </div>

      {/* Summary stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-red-100 bg-white shadow-sm p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center shrink-0">
            <PackageX className="w-5 h-5 text-red-500" />
          </div>
          <div>
            <p className="text-2xl font-bold text-red-600">{outOfStock.length}</p>
            <p className="text-xs font-medium text-stone-500 mt-0.5">Out of stock</p>
          </div>
        </div>

        <div className="rounded-2xl border border-amber-100 bg-white shadow-sm p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center shrink-0">
            <TrendingDown className="w-5 h-5 text-amber-500" />
          </div>
          <div>
            <p className="text-2xl font-bold text-amber-600">{lowStock.length}</p>
            <p className="text-xs font-medium text-stone-500 mt-0.5">Low stock</p>
          </div>
        </div>

        <div className="rounded-2xl border border-orange-100 bg-white shadow-sm p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5 text-orange-500" />
          </div>
          <div>
            <p className="text-2xl font-bold text-orange-600">{expiring.length}</p>
            <p className="text-xs font-medium text-stone-500 mt-0.5">Expiring soon</p>
          </div>
        </div>
      </div>

      {/* Out of stock */}
      <AlertSection
        title="Out of stock"
        subtitle="Needs immediate reorder"
        icon={<PackageX className="w-4 h-4 text-red-500" />}
        accentClass="bg-red-50 border-red-100"
        countBadgeClass="bg-red-100 text-red-700 hover:bg-red-100 border-0"
        items={outOfStock}
        emptyMessage="No items are out of stock"
        showExpiry={false}
        router={router}
        quantityClass="text-red-600 font-semibold"
      />

      {/* Low stock */}
      <AlertSection
        title="Low stock"
        subtitle="Below reorder threshold"
        icon={<TrendingDown className="w-4 h-4 text-amber-500" />}
        accentClass="bg-amber-50 border-amber-100"
        countBadgeClass="bg-amber-100 text-amber-700 hover:bg-amber-100 border-0"
        items={lowStock}
        emptyMessage="No items are low on stock"
        showExpiry={false}
        router={router}
        quantityClass="text-amber-600 font-semibold"
      />

      {/* Expiring soon */}
      <AlertSection
        title="Expiring soon"
        subtitle="Within the next 7 days"
        icon={<Clock className="w-4 h-4 text-orange-500" />}
        accentClass="bg-orange-50 border-orange-100"
        countBadgeClass="bg-orange-100 text-orange-700 hover:bg-orange-100 border-0"
        items={expiring}
        emptyMessage="No items expiring soon"
        showExpiry={true}
        router={router}
        quantityClass="text-stone-700 font-semibold"
      />
    </div>
  )
}

function AlertSection({
  title,
  subtitle,
  icon,
  accentClass,
  countBadgeClass,
  items,
  emptyMessage,
  showExpiry,
  router,
  quantityClass,
}: {
  title: string
  subtitle: string
  icon: React.ReactNode
  accentClass: string
  countBadgeClass: string
  items: Item[]
  emptyMessage: string
  showExpiry: boolean
  router: any
  quantityClass: string
}) {
  return (
    <div className="rounded-2xl border border-stone-200 bg-white shadow-sm overflow-hidden">
      <div className={`px-6 py-4 border-b flex items-center justify-between ${accentClass}`}>
        <div className="flex items-center gap-2.5">
          {icon}
          <div>
            <h3 className="text-sm font-semibold text-stone-800">{title}</h3>
            <p className="text-xs text-stone-400">{subtitle}</p>
          </div>
        </div>
        {items.length > 0 && (
          <Badge className={countBadgeClass}>
            {items.length} item{items.length !== 1 ? "s" : ""}
          </Badge>
        )}
      </div>

      <Table>
        <TableHeader>
          <TableRow className="bg-stone-50/50 hover:bg-stone-50/50">
            <TableHead className="text-xs font-semibold text-stone-400 uppercase tracking-wider">Name</TableHead>
            <TableHead className="text-xs font-semibold text-stone-400 uppercase tracking-wider">Category</TableHead>
            <TableHead className="text-xs font-semibold text-stone-400 uppercase tracking-wider">Supplier</TableHead>
            <TableHead className="text-xs font-semibold text-stone-400 uppercase tracking-wider">Quantity</TableHead>
            <TableHead className="text-xs font-semibold text-stone-400 uppercase tracking-wider">Threshold</TableHead>
            {showExpiry && (
              <TableHead className="text-xs font-semibold text-stone-400 uppercase tracking-wider">Expiry date</TableHead>
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.length === 0 ? (
            <TableRow>
              <TableCell colSpan={showExpiry ? 6 : 5} className="py-12 text-center">
                <div className="flex flex-col items-center gap-2 text-stone-400">
                  <AlertTriangle className="w-7 h-7 opacity-25" />
                  <p className="text-sm">{emptyMessage}</p>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            items.map((item) => (
              <TableRow
                key={item.id}
                className="hover:bg-stone-50/60 transition-colors cursor-pointer"
                onClick={() => router.push(`/inventory/${item.id}`)}
              >
                <TableCell>
                  <div>
                    <p className="font-semibold text-stone-900">{item.name}</p>
                    {item.sku && (
                      <p className="text-xs text-stone-400 font-mono">{item.sku}</p>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-stone-500 text-sm">
                  {item.categories?.name ?? <span className="text-stone-300">—</span>}
                </TableCell>
                <TableCell className="text-stone-500 text-sm">
                  {item.suppliers?.name ?? <span className="text-stone-300">—</span>}
                </TableCell>
                <TableCell className={quantityClass}>
                  {item.quantity} {item.unit}
                </TableCell>
                <TableCell className="text-stone-400 text-sm">
                  {item.reorder_threshold} {item.unit}
                </TableCell>
                {showExpiry && (
                  <TableCell className="text-orange-600 font-medium text-sm">
                    {item.expiry_date ?? "—"}
                  </TableCell>
                )}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}
