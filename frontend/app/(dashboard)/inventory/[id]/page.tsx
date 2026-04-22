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
import { Pencil, X, Check } from "lucide-react"

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
  category_id: string | null
  supplier_id: string | null
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

type Category = { id: string; name: string }
type Supplier = { id: string; name: string }

type EditForm = {
  name: string
  sku: string
  unit: string
  category_id: string
  supplier_id: string
  reorder_threshold: string
  cost_per_unit: string
  expiry_date: string
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

  const [categories, setCategories] = useState<Category[]>([])
  const [suppliers, setSuppliers] = useState<Supplier[]>([])

  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState<EditForm>({
    name: "",
    sku: "",
    unit: "",
    category_id: "",
    supplier_id: "",
    reorder_threshold: "",
    cost_per_unit: "",
    expiry_date: "",
  })
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState("")

  const [adjustForm, setAdjustForm] = useState({
    movement_type: "received",
    quantity_change: "",
    reason: "",
  })
  const [adjusting, setAdjusting] = useState(false)
  const [adjustError, setAdjustError] = useState("")

  useEffect(() => {
    fetchData()
    fetchDropdowns()
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

  async function fetchDropdowns() {
    try {
      const [catRes, supRes] = await Promise.all([
        api.get("/api/categories/"),
        api.get("/api/suppliers/"),
      ])
      setCategories(catRes.data)
      setSuppliers(supRes.data)
    } catch (err) {
      console.error(err)
    }
  }

  function startEditing() {
    if (!item) return
    setEditForm({
      name: item.name ?? "",
      sku: item.sku ?? "",
      unit: item.unit ?? "",
      category_id: item.category_id ?? "",
      supplier_id: item.supplier_id ?? "",
      reorder_threshold: String(item.reorder_threshold ?? ""),
      cost_per_unit: String(item.cost_per_unit ?? ""),
      expiry_date: item.expiry_date ?? "",
    })
    setSaveError("")
    setIsEditing(true)
  }

  function cancelEditing() {
    setIsEditing(false)
    setSaveError("")
  }

  async function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSaving(true)
    setSaveError("")

    const payload: Record<string, any> = {
      name: editForm.name || undefined,
      sku: editForm.sku || undefined,
      unit: editForm.unit || undefined,
      category_id: editForm.category_id || null,
      supplier_id: editForm.supplier_id || null,
      reorder_threshold: editForm.reorder_threshold !== "" ? parseFloat(editForm.reorder_threshold) : undefined,
      cost_per_unit: editForm.cost_per_unit !== "" ? parseFloat(editForm.cost_per_unit) : undefined,
      expiry_date: editForm.expiry_date || null,
    }

    try {
      await api.patch(`/api/inventory/${id}`, payload)
      await fetchData()
      setIsEditing(false)
    } catch (err: any) {
      setSaveError(err.response?.data?.detail ?? "Failed to save changes. Try again.")
    } finally {
      setSaving(false)
    }
  }

  async function handleAdjust(e: React.FormEvent<HTMLFormElement>) {
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
        <div className="flex items-center gap-2">
          {statusBadge(item.status)}
          {!isEditing && (
            <Button
              onClick={startEditing}
              size="sm"
              className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5 shadow-sm"
            >
              <Pencil className="w-3.5 h-3.5" />
              Edit
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Item info card */}
        <div className="rounded-2xl border border-stone-200 bg-white shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-stone-100 bg-stone-50 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-stone-700">
              {isEditing ? "Edit item details" : "Item details"}
            </h3>
            {isEditing && (
              <button
                onClick={cancelEditing}
                className="text-stone-400 hover:text-stone-600 transition-colors"
                type="button"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {isEditing ? (
            <form onSubmit={handleSave} className="px-6 py-5 space-y-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Name</Label>
                <Input
                  required
                  value={editForm.name}
                  onChange={(e) => setEditForm((p) => ({ ...p, name: e.target.value }))}
                  className="rounded-xl border-stone-200 focus-visible:ring-emerald-500"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-stone-500 uppercase tracking-wider">SKU</Label>
                <Input
                  value={editForm.sku}
                  onChange={(e) => setEditForm((p) => ({ ...p, sku: e.target.value }))}
                  className="rounded-xl border-stone-200 focus-visible:ring-emerald-500"
                  placeholder="Optional"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Unit</Label>
                <Input
                  required
                  value={editForm.unit}
                  onChange={(e) => setEditForm((p) => ({ ...p, unit: e.target.value }))}
                  className="rounded-xl border-stone-200 focus-visible:ring-emerald-500"
                  placeholder="e.g. kg, liters, pcs"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Category</Label>
                <Select
                  value={editForm.category_id || "__none__"}
                  onValueChange={(val) =>
                    setEditForm((p) => ({ ...p, category_id: val === "__none__" ? "" : val }))
                  }
                >
                  <SelectTrigger className="rounded-xl border-stone-200 focus:ring-emerald-500">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">None</SelectItem>
                    {categories.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Supplier</Label>
                <Select
                  value={editForm.supplier_id || "__none__"}
                  onValueChange={(val) =>
                    setEditForm((p) => ({ ...p, supplier_id: val === "__none__" ? "" : val }))
                  }
                >
                  <SelectTrigger className="rounded-xl border-stone-200 focus:ring-emerald-500">
                    <SelectValue placeholder="Select supplier" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">None</SelectItem>
                    {suppliers.map((s) => (
                      <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Reorder threshold</Label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={editForm.reorder_threshold}
                    onChange={(e) => setEditForm((p) => ({ ...p, reorder_threshold: e.target.value }))}
                    className="rounded-xl border-stone-200 focus-visible:ring-emerald-500"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Cost per unit ($)</Label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={editForm.cost_per_unit}
                    onChange={(e) => setEditForm((p) => ({ ...p, cost_per_unit: e.target.value }))}
                    className="rounded-xl border-stone-200 focus-visible:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Expiry date</Label>
                <Input
                  type="date"
                  value={editForm.expiry_date}
                  onChange={(e) => setEditForm((p) => ({ ...p, expiry_date: e.target.value }))}
                  className="rounded-xl border-stone-200 focus-visible:ring-emerald-500"
                />
              </div>

              {saveError && (
                <div className="flex items-start gap-2 rounded-xl bg-red-50 border border-red-100 px-3 py-2.5">
                  <svg className="w-4 h-4 text-red-500 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-sm text-red-600">{saveError}</p>
                </div>
              )}

              <div className="flex gap-2 pt-1">
                <Button
                  type="submit"
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl h-10 gap-2 shadow-sm"
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                      </svg>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      Save changes
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={cancelEditing}
                  className="rounded-xl border-stone-200 text-stone-600 hover:bg-stone-50"
                  disabled={saving}
                >
                  Cancel
                </Button>
              </div>
            </form>
          ) : (
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
          )}
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
