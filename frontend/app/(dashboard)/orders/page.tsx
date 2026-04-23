"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
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
import { Plus, ShoppingCart, Trash2 } from "lucide-react"

type Order = {
  id: string
  status: string
  total_cost: number
  notes: string
  created_at: string
  suppliers: { name: string } | null
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

export default function OrdersPage() {
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchOrders()
  }, [])

  async function fetchOrders() {
    try {
      const res = await api.get("/api/orders/")
      setOrders(res.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this order?")) return
    try {
      await api.delete(`/api/orders/${id}`)
      fetchOrders()
    } catch (err: any) {
      alert(err.response?.data?.detail ?? "Cannot delete this order")
    }
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-stone-500 py-10">
        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
        </svg>
        Loading orders...
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
            <span className="text-xs font-semibold text-emerald-600 uppercase tracking-widest">
              Purchasing
            </span>
          </div>
          <h2 className="text-2xl font-bold text-stone-900">Purchase Orders</h2>
          <p className="text-sm text-stone-400 mt-0.5">
            {orders.length} total order{orders.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Button
          onClick={() => router.push("/orders/new")}
          className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl h-10 gap-2 shadow-sm"
        >
          <Plus className="w-4 h-4" />
          New order
        </Button>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-stone-200 bg-white shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-stone-50/50 hover:bg-stone-50/50">
              <TableHead className="text-xs font-semibold text-stone-400 uppercase tracking-wider">Supplier</TableHead>
              <TableHead className="text-xs font-semibold text-stone-400 uppercase tracking-wider">Status</TableHead>
              <TableHead className="text-xs font-semibold text-stone-400 uppercase tracking-wider">Total cost</TableHead>
              <TableHead className="text-xs font-semibold text-stone-400 uppercase tracking-wider">Notes</TableHead>
              <TableHead className="text-xs font-semibold text-stone-400 uppercase tracking-wider">Date</TableHead>
              <TableHead className="text-xs font-semibold text-stone-400 uppercase tracking-wider">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="py-16 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                      <ShoppingCart className="w-5 h-5 text-emerald-400" />
                    </div>
                    <p className="text-stone-500 font-medium text-sm">No orders yet</p>
                    <p className="text-stone-400 text-xs">Create a new purchase order to get started</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              orders.map((order) => (
                <TableRow
                  key={order.id}
                  className="hover:bg-stone-50/60 transition-colors cursor-pointer"
                  onClick={() => router.push(`/orders/${order.id}`)}
                >
                  <TableCell>
                    <span className="font-semibold text-stone-900">
                      {order.suppliers?.name ?? <span className="text-stone-400">—</span>}
                    </span>
                  </TableCell>
                  <TableCell>{statusBadge(order.status)}</TableCell>
                  <TableCell className="font-semibold text-emerald-700">
                    ${order.total_cost.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-stone-400 text-sm max-w-40 truncate">
                    {order.notes ?? "—"}
                  </TableCell>
                  <TableCell className="text-stone-400 text-sm">
                    {new Date(order.created_at).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </TableCell>
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    {["draft", "cancelled"].includes(order.status) && (
                      <button
                        onClick={() => handleDelete(order.id)}
                        className="inline-flex items-center gap-1.5 text-xs text-red-500 hover:text-red-700 hover:bg-red-50 px-2.5 py-1.5 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Delete
                      </button>
                    )}
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
