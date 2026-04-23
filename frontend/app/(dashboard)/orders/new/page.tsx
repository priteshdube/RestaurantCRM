"use client"

import { useEffect, useState } from "react"
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
import { Textarea } from "@/components/ui/textarea"
import { Plus, X, Check } from "lucide-react"

type Supplier = { id: string; name: string }
type InventoryItem = { id: string; name: string; unit: string; cost_per_unit: number }
type OrderLine = {
  item_id: string
  item_name: string
  unit: string
  quantity_ordered: string
  unit_cost: string
}

export default function NewOrderPage() {
  const router = useRouter()
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([])
  const [supplierId, setSupplierId] = useState("")
  const [notes, setNotes] = useState("")
  const [lines, setLines] = useState<OrderLine[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    async function fetchDropdowns() {
      const [supRes, itemRes] = await Promise.all([
        api.get("/api/suppliers/"),
        api.get("/api/inventory/"),
      ])
      setSuppliers(supRes.data)
      setInventoryItems(itemRes.data)
    }
    fetchDropdowns()
  }, [])

  function addLine() {
    setLines((prev) => [
      ...prev,
      { item_id: "", item_name: "", unit: "", quantity_ordered: "", unit_cost: "" },
    ])
  }

  function removeLine(index: number) {
    setLines((prev) => prev.filter((_, i) => i !== index))
  }

  function updateLine(index: number, field: string, value: string) {
    setLines((prev) =>
      prev.map((line, i) => {
        if (i !== index) return line
        if (field === "item_id") {
          const item = inventoryItems.find((it) => it.id === value)
          return {
            ...line,
            item_id: value,
            item_name: item?.name ?? "",
            unit: item?.unit ?? "",
            unit_cost: item?.cost_per_unit?.toString() ?? "",
          }
        }
        return { ...line, [field]: value }
      })
    )
  }

  const totalCost = lines.reduce((sum, line) => {
    const qty = parseFloat(line.quantity_ordered) || 0
    const cost = parseFloat(line.unit_cost) || 0
    return sum + qty * cost
  }, 0)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!supplierId) return setError("Please select a supplier")
    if (lines.length === 0) return setError("Add at least one item")
    if (lines.some((l) => !l.item_id || parseFloat(l.quantity_ordered) <= 0 || parseFloat(l.unit_cost) < 0)) {
      return setError("Please fill in all item fields with valid values")
    }

    setSubmitting(true)
    setError("")

    try {
      await api.post("/api/orders/", {
        supplier_id: supplierId,
        notes: notes || undefined,
        items: lines.map((l) => ({
          item_id: l.item_id,
          quantity_ordered: parseFloat(l.quantity_ordered),
          unit_cost: parseFloat(l.unit_cost),
        })),
      })
      router.push("/orders")
    } catch (err) {
      setError("Failed to create order. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
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
            Purchasing
          </span>
        </div>
        <h2 className="text-2xl font-bold text-stone-900">New purchase order</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Order details card */}
        <div className="rounded-2xl border border-stone-200 bg-white shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-stone-100 bg-stone-50">
            <h3 className="text-sm font-semibold text-stone-700">Order details</h3>
          </div>
          <div className="px-6 py-5 space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
                Supplier <span className="text-red-400">*</span>
              </Label>
              <Select onValueChange={setSupplierId}>
                <SelectTrigger className="rounded-xl border-stone-200 focus:ring-emerald-500">
                  <SelectValue placeholder="Select supplier" />
                </SelectTrigger>
                <SelectContent>
                  {suppliers.map((s) => (
                    <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Notes</Label>
              <Textarea
                placeholder="Any special instructions..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                className="rounded-xl border-stone-200 focus-visible:ring-emerald-500 resize-none"
              />
            </div>
          </div>
        </div>

        {/* Order items card */}
        <div className="rounded-2xl border border-stone-200 bg-white shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-stone-100 bg-stone-50 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-stone-700">Items</h3>
            <Button
              type="button"
              size="sm"
              onClick={addLine}
              className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl h-8 gap-1.5 shadow-sm text-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              Add item
            </Button>
          </div>

          <div className="px-6 py-5 space-y-3">
            {lines.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-8 text-stone-400">
                <svg className="w-8 h-8 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7H4a2 2 0 00-2 2v6a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2zM16 3H8a2 2 0 00-2 2v2h12V5a2 2 0 00-2-2z" />
                </svg>
                <p className="text-sm">No items added yet</p>
                <p className="text-xs">Click "Add item" to start building your order</p>
              </div>
            ) : (
              <>
                {/* Column labels */}
                <div className="grid grid-cols-12 gap-3 px-1">
                  <div className="col-span-5">
                    <span className="text-xs font-semibold text-stone-400 uppercase tracking-wider">Item</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-xs font-semibold text-stone-400 uppercase tracking-wider">Unit</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-xs font-semibold text-stone-400 uppercase tracking-wider">Qty</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-xs font-semibold text-stone-400 uppercase tracking-wider">Cost ($)</span>
                  </div>
                </div>

                {lines.map((line, index) => (
                  <div
                    key={index}
                    className="grid grid-cols-12 gap-3 items-center bg-stone-50/60 rounded-xl px-3 py-3 border border-stone-100"
                  >
                    <div className="col-span-5">
                      <Select
                        value={line.item_id || undefined}
                        onValueChange={(val) => updateLine(index, "item_id", val)}
                      >
                        <SelectTrigger className="rounded-xl border-stone-200 focus:ring-emerald-500 bg-white h-9 text-sm">
                          <SelectValue placeholder="Select item" />
                        </SelectTrigger>
                        <SelectContent>
                          {inventoryItems.map((item) => (
                            <SelectItem key={item.id} value={item.id}>{item.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="col-span-2">
                      <Input
                        value={line.unit}
                        readOnly
                        className="rounded-xl border-stone-200 bg-stone-100 text-stone-500 h-9 text-sm"
                      />
                    </div>
                    <div className="col-span-2">
                      <Input
                        type="number"
                        min="0.01"
                        step="0.01"
                        placeholder="0"
                        value={line.quantity_ordered}
                        onChange={(e) => updateLine(index, "quantity_ordered", e.target.value)}
                        className="rounded-xl border-stone-200 focus-visible:ring-emerald-500 bg-white h-9 text-sm"
                      />
                    </div>
                    <div className="col-span-2">
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                        value={line.unit_cost}
                        onChange={(e) => updateLine(index, "unit_cost", e.target.value)}
                        className="rounded-xl border-stone-200 focus-visible:ring-emerald-500 bg-white h-9 text-sm"
                      />
                    </div>
                    <div className="col-span-1 flex justify-end">
                      <button
                        type="button"
                        onClick={() => removeLine(index)}
                        className="w-7 h-7 flex items-center justify-center rounded-lg text-stone-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}

                <div className="flex justify-end pt-2 border-t border-stone-100 mt-2">
                  <div className="text-right">
                    <p className="text-xs text-stone-400 uppercase tracking-wider font-semibold mb-0.5">Total</p>
                    <p className="text-xl font-bold text-emerald-700">${totalCost.toFixed(2)}</p>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {error && (
          <div className="flex items-start gap-2 rounded-xl bg-red-50 border border-red-100 px-4 py-3">
            <svg className="w-4 h-4 text-red-500 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <div className="flex gap-3">
          <Button
            type="submit"
            disabled={submitting}
            className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl h-10 gap-2 shadow-sm px-6"
          >
            {submitting ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                Creating...
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                Create order
              </>
            )}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/orders")}
            className="rounded-xl border-stone-200 text-stone-600 hover:bg-stone-50 h-10"
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  )
}
