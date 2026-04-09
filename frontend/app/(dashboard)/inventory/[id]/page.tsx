"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import api from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

type Item = {
  id: string
  name: string
  sku: string
  unit: string
  quantity: number
  reorder_threshold: number
  cost_per_unit: number
  status: string
  expiry_date: string
  categories: { name: string } | null
  suppliers: { name: string } | null
}

type Movement = {
  id: string
  movement_type: string
  quantity_change: number
  reason: string
  performed_by: string
  created_at: string
}

const statusBadge = (status: string) => {
  switch (status) {
    case "in_stock":
      return (
        <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-0 gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
          In stock
        </Badge>
      )
    case "low_stock":
      return (
        <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-0 gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 inline-block" />
          Low stock
        </Badge>
      )
    case "out_of_stock":
      return (
        <Badge className="bg-red-100 text-red-700 hover:bg-red-100 border-0 gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-red-500 inline-block" />
          Out of stock
        </Badge>
      )
    case "expired":
      return (
        <Badge className="bg-stone-100 text-stone-600 hover:bg-stone-100 border-0 gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-stone-400 inline-block" />
          Expired
        </Badge>
      )
    default:
      return null
  }
}

const movementTypeBadge = (type: string) => {
  switch (type) {
    case "received":
      return <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full capitalize">Received</span>
    case "adjusted":
      return <span className="inline-flex items-center gap-1 text-xs font-medium text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full capitalize">Adjusted</span>
    case "wasted":
      return <span className="inline-flex items-center gap-1 text-xs font-medium text-red-700 bg-red-50 px-2 py-0.5 rounded-full capitalize">Wasted</span>
    case "used":
      return <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full capitalize">Used</span>
    default:
      return <span className="text-xs text-stone-500 capitalize">{type}</span>
  }
}

export default function ItemDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const [item, setItem] = useState<Item | null>(null)
  const [movements, setMovements] = useState<Movement[]>([])
  const [loading, setLoading] = useState(true)

  const [adjustForm, setAdjustForm] = useState({
    movement_type: "received",
    quantity_change: "",
    reason: "",
  })
  const [adjusting, setAdjusting] = useState(false)
  const [adjustError, setAdjustError] = useState("")

  useEffect(() => {
    fetchData()
  }, [id])

  async function fetchData() {
    try {
      const [itemRes, movRes] = await Promise.all([
        api.get(`/api/inventory/${id}`),
        api.get(`/api/inventory/${id}/movements`),
      ])
      setItem(itemRes.data)
      setMovements(movRes.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  async function handleAdjust(e: React.FormEvent) {
    e.preventDefault()
    setAdjusting(true)
    setAdjustError("")

    const isNegative = ["wasted", "used"].includes(adjustForm.movement_type)
    const quantityChange = isNegative
      ? -Math.abs(parseFloat(adjustForm.quantity_change))
      : Math.abs(parseFloat(adjustForm.quantity_change))

    try {
      await api.post(`/api/inventory/${id}/adjust`, {
        movement_type: adjustForm.movement_type,
        quantity_change: quantityChange,
        reason: adjustForm.reason || undefined,
      })
      setAdjustForm({ movement_type: "received", quantity_change: "", reason: "" })
      fetchData()
    } catch (err: any) {
      setAdjustError(
        err.response?.data?.detail ?? "Adjustment failed. Try again."
      )
    } finally {
      setAdjusting(false)
    }
  }

  if (loading)
    return (
      <div className="flex items-center gap-2 text-stone-500 py-10">
        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
        </svg>
        Loading item...
      </div>
    )

  if (!item)
    return (
      <div className="flex items-center gap-2 text-red-500 py-10">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        Item not found.
      </div>
    )

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <button
            onClick={() => router.push("/inventory")}
            className="inline-flex items-center gap-1 text-xs text-stone-400 hover:text-emerald-600 transition-colors mb-2"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to inventory
          </button>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
            <span className="text-xs font-semibold text-emerald-600 uppercase tracking-widest">
              Item Detail
            </span>
          </div>
          <h2 className="text-2xl font-bold text-stone-900">{item.name}</h2>
          {item.sku && (
            <p className="text-xs text-stone-400 font-mono mt-0.5">SKU: {item.sku}</p>
          )}
        </div>
        {statusBadge(item.status)}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Item info card */}
        <div className="rounded-2xl border border-stone-200 bg-white shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-stone-100 bg-stone-50">
            <h3 className="text-sm font-semibold text-stone-700">Item details</h3>
          </div>
          <div className="px-6 py-4 space-y-3">
            {[
              { label: "Category", value: item.categories?.name ?? "—" },
              { label: "Supplier", value: item.suppliers?.name ?? "—" },
              { label: "Unit", value: item.unit },
              {
                label: "Current quantity",
                value: (
                  <span
                    className={
                      item.quantity <= item.reorder_threshold
                        ? "text-amber-600 font-semibold"
                        : "text-stone-900 font-semibold"
                    }
                  >
                    {item.quantity} {item.unit}
                  </span>
                ),
              },
              {
                label: "Reorder threshold",
                value: `${item.reorder_threshold} ${item.unit}`,
              },
              {
                label: "Cost per unit",
                value: `$${item.cost_per_unit}`,
              },
              {
                label: "Total value",
                value: (
                  <span className="font-semibold text-emerald-700">
                    ${(item.quantity * item.cost_per_unit).toFixed(2)}
                  </span>
                ),
              },
              {
                label: "Expiry date",
                value: item.expiry_date ?? "—",
              },
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between items-center text-sm py-1 border-b border-stone-50 last:border-0">
                <span className="text-stone-400 text-xs font-medium uppercase tracking-wider">{label}</span>
                <span className="text-stone-800">{value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Adjust stock card */}
        <div className="rounded-2xl border border-stone-200 bg-white shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-stone-100 bg-stone-50">
            <h3 className="text-sm font-semibold text-stone-700">Adjust stock</h3>
          </div>
          <div className="px-6 py-5">
            <form onSubmit={handleAdjust} className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Movement type</Label>
                <Select
                  value={adjustForm.movement_type}
                  onValueChange={(val) =>
                    setAdjustForm((prev) => ({ ...prev, movement_type: val }))
                  }
                >
                  <SelectTrigger className="rounded-xl border-stone-200 focus:ring-emerald-500">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="received">Received (+)</SelectItem>
                    <SelectItem value="adjusted">Adjusted (+/-)</SelectItem>
                    <SelectItem value="wasted">Wasted (-)</SelectItem>
                    <SelectItem value="used">Used (-)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Quantity</Label>
                <Input
                  required
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0"
                  value={adjustForm.quantity_change}
                  onChange={(e) =>
                    setAdjustForm((prev) => ({
                      ...prev,
                      quantity_change: e.target.value,
                    }))
                  }
                  className="rounded-xl border-stone-200 focus-visible:ring-emerald-500"
                />
                <p className="text-xs text-stone-400">
                  {["wasted", "used"].includes(adjustForm.movement_type)
                    ? "Will be subtracted from current stock"
                    : "Will be added to current stock"}
                </p>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Reason (optional)</Label>
                <Input
                  placeholder="e.g. weekly delivery, spoiled"
                  value={adjustForm.reason}
                  onChange={(e) =>
                    setAdjustForm((prev) => ({ ...prev, reason: e.target.value }))
                  }
                  className="rounded-xl border-stone-200 focus-visible:ring-emerald-500"
                />
              </div>

              {adjustError && (
                <div className="flex items-start gap-2 rounded-xl bg-red-50 border border-red-100 px-3 py-2.5">
                  <svg className="w-4 h-4 text-red-500 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-sm text-red-600">{adjustError}</p>
                </div>
              )}

              <Button
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl h-10 gap-2 shadow-sm"
                disabled={adjusting}
              >
                {adjusting ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    Saving...
                  </>
                ) : (
                  "Save adjustment"
                )}
              </Button>
            </form>
          </div>
        </div>
      </div>

      {/* Movement history */}
      <div className="rounded-2xl border border-stone-200 bg-white shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-stone-100 bg-stone-50 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-stone-700">Stock movement history</h3>
          {movements.length > 0 && (
            <span className="text-xs text-stone-400">{movements.length} records</span>
          )}
        </div>
        <Table>
          <TableHeader>
            <TableRow className="bg-stone-50/50 hover:bg-stone-50/50">
              <TableHead className="text-xs font-semibold text-stone-400 uppercase tracking-wider">Type</TableHead>
              <TableHead className="text-xs font-semibold text-stone-400 uppercase tracking-wider">Change</TableHead>
              <TableHead className="text-xs font-semibold text-stone-400 uppercase tracking-wider">Reason</TableHead>
              <TableHead className="text-xs font-semibold text-stone-400 uppercase tracking-wider">Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {movements.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-10">
                  <div className="flex flex-col items-center gap-2 text-stone-400">
                    <svg className="w-8 h-8 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    <p className="text-sm">No movements recorded yet</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              movements.map((m) => (
                <TableRow key={m.id} className="hover:bg-stone-50/60 transition-colors">
                  <TableCell>{movementTypeBadge(m.movement_type)}</TableCell>
                  <TableCell>
                    <span
                      className={
                        m.quantity_change > 0
                          ? "text-emerald-600 font-semibold"
                          : "text-red-500 font-semibold"
                      }
                    >
                      {m.quantity_change > 0 ? "+" : ""}
                      {m.quantity_change}
                    </span>
                  </TableCell>
                  <TableCell className="text-stone-500 text-sm">
                    {m.reason ?? <span className="text-stone-300">—</span>}
                  </TableCell>
                  <TableCell className="text-stone-400 text-xs">
                    {new Date(m.created_at).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
