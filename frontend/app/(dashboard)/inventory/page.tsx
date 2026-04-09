"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import api from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

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
        <Badge className="bg-stone-100 text-stone-500 hover:bg-stone-100 border-0 gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-stone-400 inline-block" />
          Expired
        </Badge>
      )
    default:
      return null
  }
}

export default function InventoryPage() {
  const router = useRouter()
  const [items, setItems] = useState<Item[]>([])
  const [filtered, setFiltered] = useState<Item[]>([])
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchItems()
  }, [])

  useEffect(() => {
    let result = items
    if (search) {
      result = result.filter((i) =>
        i.name.toLowerCase().includes(search.toLowerCase()) ||
        i.sku?.toLowerCase().includes(search.toLowerCase())
      )
    }
    if (statusFilter !== "all") {
      result = result.filter((i) => i.status === statusFilter)
    }
    setFiltered(result)
  }, [search, statusFilter, items])

  async function fetchItems() {
    try {
      const res = await api.get("/api/inventory/")
      setItems(res.data)
      setFiltered(res.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this item?")) return
    await api.delete(`/api/inventory/${id}`)
    fetchItems()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-[3px] border-emerald-500 border-t-transparent animate-spin" />
          <p className="text-emerald-600 text-sm font-medium">Loading inventory...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
            <span className="text-xs font-semibold text-emerald-600 uppercase tracking-widest">
              Stock Management
            </span>
          </div>
          <h2 className="text-2xl font-bold text-stone-900">Inventory</h2>
          <p className="text-sm text-stone-500 mt-1">{items.length} total items</p>
        </div>
        <Button
          onClick={() => router.push("/inventory/new")}
          className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl px-4 h-10 gap-2 shadow-sm"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add item
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <div className="relative max-w-sm w-full">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400"
            fill="none" stroke="currentColor" viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <Input
            placeholder="Search by name or SKU..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 rounded-xl border-stone-200 focus-visible:ring-emerald-500"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-44 rounded-xl border-stone-200 focus:ring-emerald-500">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All status</SelectItem>
            <SelectItem value="in_stock">In stock</SelectItem>
            <SelectItem value="low_stock">Low stock</SelectItem>
            <SelectItem value="out_of_stock">Out of stock</SelectItem>
            <SelectItem value="expired">Expired</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-stone-200 bg-white overflow-hidden shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-stone-50 hover:bg-stone-50 border-stone-200">
              <TableHead className="text-xs font-semibold text-stone-500 uppercase tracking-wider py-3.5">Name</TableHead>
              <TableHead className="text-xs font-semibold text-stone-500 uppercase tracking-wider py-3.5">SKU</TableHead>
              <TableHead className="text-xs font-semibold text-stone-500 uppercase tracking-wider py-3.5">Category</TableHead>
              <TableHead className="text-xs font-semibold text-stone-500 uppercase tracking-wider py-3.5">Quantity</TableHead>
              <TableHead className="text-xs font-semibold text-stone-500 uppercase tracking-wider py-3.5">Unit</TableHead>
              <TableHead className="text-xs font-semibold text-stone-500 uppercase tracking-wider py-3.5">Cost/unit</TableHead>
              <TableHead className="text-xs font-semibold text-stone-500 uppercase tracking-wider py-3.5">Status</TableHead>
              <TableHead className="text-xs font-semibold text-stone-500 uppercase tracking-wider py-3.5">Expiry</TableHead>
              <TableHead className="text-xs font-semibold text-stone-500 uppercase tracking-wider py-3.5">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="py-16 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                      <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                    </div>
                    <p className="text-stone-500 font-medium text-sm">No items found</p>
                    <p className="text-stone-400 text-xs">
                      {items.length === 0 ? "Add your first item to get started." : "Try adjusting your search or filter."}
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((item) => (
                <TableRow key={item.id} className="border-stone-100 hover:bg-stone-50 transition-colors group">
                  <TableCell className="font-semibold text-stone-900 group-hover:text-emerald-700 transition-colors">
                    {item.name}
                  </TableCell>
                  <TableCell className="text-stone-400 text-sm font-mono">
                    {item.sku ?? "—"}
                  </TableCell>
                  <TableCell className="text-stone-600">
                    {item.categories?.name ?? <span className="text-stone-300">—</span>}
                  </TableCell>
                  <TableCell
                    className={`font-semibold ${
                      item.quantity <= item.reorder_threshold
                        ? "text-amber-600"
                        : "text-stone-800"
                    }`}
                  >
                    {item.quantity}
                  </TableCell>
                  <TableCell className="text-stone-500 text-sm">{item.unit}</TableCell>
                  <TableCell className="text-stone-700 font-medium">${item.cost_per_unit}</TableCell>
                  <TableCell>{statusBadge(item.status)}</TableCell>
                  <TableCell className="text-sm text-stone-500">
                    {item.expiry_date ?? <span className="text-stone-300">—</span>}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="rounded-lg border-stone-200 text-stone-600 hover:text-emerald-700 hover:border-emerald-300 hover:bg-emerald-50 h-8 text-xs"
                        onClick={() => router.push(`/inventory/${item.id}`)}
                      >
                        View
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="rounded-lg border-red-100 text-red-500 hover:text-red-700 hover:bg-red-50 hover:border-red-200 h-8 text-xs"
                        onClick={() => handleDelete(item.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        {filtered.length > 0 && (
          <div className="px-5 py-3 bg-stone-50 border-t border-stone-200 text-xs text-stone-400">
            Showing {filtered.length} of {items.length} items
          </div>
        )}
      </div>
    </div>
  )
}
