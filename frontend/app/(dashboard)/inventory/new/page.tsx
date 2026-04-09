"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import api from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

type Category = { id: string; name: string }
type Supplier = { id: string; name: string }

export default function NewItemPage() {
  const router = useRouter()
  const [categories, setCategories] = useState<Category[]>([])
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const [form, setForm] = useState({
    name: "",
    sku: "",
    unit: "",
    quantity: "",
    reorder_threshold: "",
    cost_per_unit: "",
    expiry_date: "",
    category_id: "",
    supplier_id: "",
  })

  useEffect(() => {
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
    fetchDropdowns()
  }, [])

  function handleChange(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      await api.post("/api/inventory/", {
        name: form.name,
        sku: form.sku || undefined,
        unit: form.unit,
        quantity: parseFloat(form.quantity),
        reorder_threshold: parseFloat(form.reorder_threshold),
        cost_per_unit: parseFloat(form.cost_per_unit),
        expiry_date: form.expiry_date || undefined,
        category_id: form.category_id || undefined,
        supplier_id: form.supplier_id || undefined,
      })
      router.push("/inventory")
    } catch (err: any) {
      setError("Failed to create item. Please check your inputs.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
          <span className="text-xs font-semibold text-emerald-600 uppercase tracking-widest">
            Stock Management
          </span>
        </div>
        <h2 className="text-2xl font-bold text-stone-900">Add new item</h2>
        <p className="text-sm text-stone-500 mt-1">
          Fill in the details below to add a new item to your inventory.
        </p>
      </div>

      <div className="rounded-2xl border border-stone-200 bg-white shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-stone-100 bg-stone-50">
          <h3 className="text-sm font-semibold text-stone-700">Item details</h3>
        </div>
        <div className="px-6 py-5">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Name *</Label>
                <Input
                  required
                  value={form.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  placeholder="e.g. Tomatoes"
                  className="rounded-xl border-stone-200 focus-visible:ring-emerald-500"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-stone-500 uppercase tracking-wider">SKU</Label>
                <Input
                  value={form.sku}
                  onChange={(e) => handleChange("sku", e.target.value)}
                  placeholder="e.g. PROD-001"
                  className="rounded-xl border-stone-200 focus-visible:ring-emerald-500 font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Unit *</Label>
                <Input
                  required
                  value={form.unit}
                  onChange={(e) => handleChange("unit", e.target.value)}
                  placeholder="e.g. kg, liters, pieces"
                  className="rounded-xl border-stone-200 focus-visible:ring-emerald-500"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Quantity *</Label>
                <Input
                  required
                  type="number"
                  value={form.quantity}
                  onChange={(e) => handleChange("quantity", e.target.value)}
                  placeholder="0"
                  className="rounded-xl border-stone-200 focus-visible:ring-emerald-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Reorder threshold *</Label>
                <Input
                  required
                  type="number"
                  value={form.reorder_threshold}
                  onChange={(e) =>
                    handleChange("reorder_threshold", e.target.value)
                  }
                  placeholder="0"
                  className="rounded-xl border-stone-200 focus-visible:ring-emerald-500"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Cost per unit *</Label>
                <Input
                  required
                  type="number"
                  value={form.cost_per_unit}
                  onChange={(e) =>
                    handleChange("cost_per_unit", e.target.value)
                  }
                  placeholder="0.00"
                  className="rounded-xl border-stone-200 focus-visible:ring-emerald-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Category</Label>
                <Select onValueChange={(val) => handleChange("category_id", val)}>
                  <SelectTrigger className="rounded-xl border-stone-200 focus:ring-emerald-500">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Supplier</Label>
                <Select onValueChange={(val) => handleChange("supplier_id", val)}>
                  <SelectTrigger className="rounded-xl border-stone-200 focus:ring-emerald-500">
                    <SelectValue placeholder="Select supplier" />
                  </SelectTrigger>
                  <SelectContent>
                    {suppliers.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Expiry date</Label>
              <Input
                type="date"
                value={form.expiry_date}
                onChange={(e) => handleChange("expiry_date", e.target.value)}
                className="rounded-xl border-stone-200 focus-visible:ring-emerald-500 max-w-xs"
              />
            </div>

            {error && (
              <div className="flex items-start gap-2 rounded-xl bg-red-50 border border-red-100 px-3 py-2.5">
                <svg className="w-4 h-4 text-red-500 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <div className="flex gap-3 pt-3 border-t border-stone-100">
              <Button
                type="submit"
                disabled={loading}
                className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl px-5 h-10 gap-2 shadow-sm"
              >
                {loading ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    Creating...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Create item
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/inventory")}
                className="rounded-xl border-stone-200 text-stone-600 hover:bg-stone-50 h-10 px-5"
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
