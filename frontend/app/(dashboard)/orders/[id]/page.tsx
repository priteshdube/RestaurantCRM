"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import api from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { SendHorizonal, PackageCheck, X } from "lucide-react"

type OrderItem = {
  id: string
  quantity_ordered: number
  unit_cost: number
  inventory_items: { name: string; unit: string } | null
}

type Order = {
  id: string
  status: string
  total_cost: number
  notes: string
  created_at: string
  suppliers: { name: string } | null
  purchase_order_items: OrderItem[]
}

const statusBadge = (status: string) => {
  switch (status) {
    case "draft":
      return (
        <Badge className="bg-stone-100 text-stone-600 hover:bg-stone-100 border-0 gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-stone-400 inline-block" />
          Draft
        </Badge>
      )
    case "sent":
      return (
        <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-0 gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 inline-block" />
          Sent
        </Badge>
      )
    case "received":
      return (
        <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-0 gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
          Received
        </Badge>
      )
    case "cancelled":
      return (
        <Badge className="bg-red-100 text-red-700 hover:bg-red-100 border-0 gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-red-500 inline-block" />
          Cancelled
        </Badge>
      )
    default:
      return null
  }
}

const nextStatus: Record<string, string> = {
  draft: "sent",
  sent: "received",
}

const nextStatusConfig: Record<string, { label: string; icon: React.ReactNode }> = {
  draft: { label: "Mark as sent", icon: <SendHorizonal className="w-4 h-4" /> },
  sent:  { label: "Mark as received", icon: <PackageCheck className="w-4 h-4" /> },
}

export default function OrderDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    fetchOrder()
  }, [id])

  async function fetchOrder() {
    try {
      const res = await api.get(`/api/orders/${id}`)
      setOrder(res.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  async function handleStatusUpdate(status: string) {
    if (
      status === "received" &&
      !confirm("Marking as received will automatically update inventory quantities. Continue?")
    )
      return

    setUpdating(true)
    try {
      await api.patch(`/api/orders/${id}/status`, { status })
      fetchOrder()
    } catch (err: any) {
      alert(err.response?.data?.detail ?? "Failed to update status")
    } finally {
      setUpdating(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-stone-500 py-10">
        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
        </svg>
        Loading order...
      </div>
    )
  }

  if (!order) {
    return (
      <div className="flex items-center gap-2 text-red-500 py-10">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        Order not found.
      </div>
    )
  }

  const items = order.purchase_order_items ?? []

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <button
            onClick={() => router.push("/orders")}
            className="inline-flex items-center gap-1 text-xs text-stone-400 hover:text-emerald-600 transition-colors mb-2"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to orders
          </button>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
            <span className="text-xs font-semibold text-emerald-600 uppercase tracking-widest">
              Purchase Order
            </span>
          </div>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold text-stone-900">
              {order.suppliers?.name ?? "Unknown supplier"}
            </h2>
            {statusBadge(order.status)}
          </div>
        </div>

        <div className="flex gap-2">
          {nextStatus[order.status] && (
            <Button
              onClick={() => handleStatusUpdate(nextStatus[order.status])}
              disabled={updating}
              className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl h-10 gap-2 shadow-sm"
            >
              {updating ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Updating...
                </>
              ) : (
                <>
                  {nextStatusConfig[order.status]?.icon}
                  {nextStatusConfig[order.status]?.label}
                </>
              )}
            </Button>
          )}
          {["draft", "sent"].includes(order.status) && (
            <Button
              variant="outline"
              onClick={() => handleStatusUpdate("cancelled")}
              disabled={updating}
              className="rounded-xl border-stone-200 text-red-500 hover:bg-red-50 hover:border-red-200 h-10 gap-2"
            >
              <X className="w-4 h-4" />
              Cancel order
            </Button>
          )}
        </div>
      </div>

      {/* Order details card */}
      <div className="rounded-2xl border border-stone-200 bg-white shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-stone-100 bg-stone-50">
          <h3 className="text-sm font-semibold text-stone-700">Order details</h3>
        </div>
        <div className="px-6 py-4 space-y-3">
          {[
            { label: "Supplier", value: order.suppliers?.name ?? "—" },
            { label: "Status", value: statusBadge(order.status) },
            {
              label: "Total cost",
              value: <span className="font-semibold text-emerald-700">${order.total_cost.toFixed(2)}</span>,
            },
            { label: "Notes", value: order.notes ?? "—" },
            {
              label: "Created",
              value: new Date(order.created_at).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              }),
            },
          ].map(({ label, value }) => (
            <div key={label} className="flex justify-between items-center text-sm py-1 border-b border-stone-50 last:border-0">
              <span className="text-stone-400 text-xs font-medium uppercase tracking-wider">{label}</span>
              <span className="text-stone-800">{value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Order items card */}
      <div className="rounded-2xl border border-stone-200 bg-white shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-stone-100 bg-stone-50 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-stone-700">Ordered items</h3>
          {items.length > 0 && (
            <span className="text-xs text-stone-400">{items.length} item{items.length !== 1 ? "s" : ""}</span>
          )}
        </div>
        <Table>
          <TableHeader>
            <TableRow className="bg-stone-50/50 hover:bg-stone-50/50">
              <TableHead className="text-xs font-semibold text-stone-400 uppercase tracking-wider">Item</TableHead>
              <TableHead className="text-xs font-semibold text-stone-400 uppercase tracking-wider">Quantity</TableHead>
              <TableHead className="text-xs font-semibold text-stone-400 uppercase tracking-wider">Unit</TableHead>
              <TableHead className="text-xs font-semibold text-stone-400 uppercase tracking-wider">Unit cost</TableHead>
              <TableHead className="text-xs font-semibold text-stone-400 uppercase tracking-wider">Subtotal</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((oi) => (
              <TableRow key={oi.id} className="hover:bg-stone-50/60 transition-colors">
                <TableCell className="font-semibold text-stone-900">
                  {oi.inventory_items?.name ?? "—"}
                </TableCell>
                <TableCell className="text-stone-600">{oi.quantity_ordered}</TableCell>
                <TableCell className="text-stone-400 text-sm">{oi.inventory_items?.unit ?? "—"}</TableCell>
                <TableCell className="text-stone-600">${oi.unit_cost.toFixed(2)}</TableCell>
                <TableCell className="font-semibold text-stone-900">
                  ${(oi.quantity_ordered * oi.unit_cost).toFixed(2)}
                </TableCell>
              </TableRow>
            ))}
            <TableRow className="bg-stone-50/50 hover:bg-stone-50/50">
              <TableCell colSpan={4} className="text-right text-xs font-semibold text-stone-400 uppercase tracking-wider">
                Total
              </TableCell>
              <TableCell className="font-bold text-emerald-700 text-base">
                ${order.total_cost.toFixed(2)}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
