"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import api from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ArrowLeft, Building2, Package, Pencil, Truck, X } from "lucide-react"

type Supplier = {
  id: string
  name: string
  contact_name: string
  contact_email: string
  contact_phone: string
  lead_time_days: number
  inventory_items: {
    id: string
    name: string
    quantity: number
    unit: string
    status: string
  }[]
}

const statusConfig: Record<string, { label: string; className: string }> = {
  in_stock:     { label: "In stock",     className: "bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-0" },
  low_stock:    { label: "Low stock",    className: "bg-amber-100 text-amber-700 hover:bg-amber-100 border-0" },
  out_of_stock: { label: "Out of stock", className: "bg-red-100 text-red-700 hover:bg-red-100 border-0" },
}

export default function SupplierDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const [supplier, setSupplier] = useState<Supplier | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    name: "",
    contact_name: "",
    contact_email: "",
    contact_phone: "",
    lead_time_days: "",
  })

  useEffect(() => {
    fetchSupplier()
  }, [id])

  async function fetchSupplier() {
    try {
      const res = await api.get(`/api/suppliers/${id}`)
      setSupplier(res.data)
      setForm({
        name: res.data.name,
        contact_name: res.data.contact_name ?? "",
        contact_email: res.data.contact_email ?? "",
        contact_phone: res.data.contact_phone ?? "",
        lead_time_days: res.data.lead_time_days?.toString() ?? "3",
      })
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      await api.patch(`/api/suppliers/${id}`, {
        ...form,
        lead_time_days: parseInt(form.lead_time_days),
      })
      setEditing(false)
      fetchSupplier()
    } catch (err) {
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-[3px] border-emerald-500 border-t-transparent animate-spin" />
          <p className="text-emerald-600 text-sm font-medium">Loading supplier...</p>
        </div>
      </div>
    )
  }

  if (!supplier) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
            <Building2 className="w-5 h-5 text-red-400" />
          </div>
          <p className="text-stone-500 font-medium text-sm">Supplier not found</p>
        </div>
      </div>
    )
  }

  const totalItems = supplier.inventory_items?.length ?? 0
  const lowStock = supplier.inventory_items?.filter((i) => i.status === "low_stock").length ?? 0
  const outOfStock = supplier.inventory_items?.filter((i) => i.status === "out_of_stock").length ?? 0

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Back + Header */}
      <div>
        <button
          onClick={() => router.push("/suppliers")}
          className="flex items-center gap-1.5 text-sm text-stone-400 hover:text-emerald-600 transition-colors mb-3"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to suppliers
        </button>

        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-xs font-semibold text-emerald-600 uppercase tracking-widest">
                Supplier detail
              </span>
            </div>
            <h2 className="text-2xl font-bold text-stone-900">{supplier.name}</h2>
          </div>

          <Button
            onClick={() => setEditing(!editing)}
            className={
              editing
                ? "rounded-xl border-stone-200 text-stone-600 bg-white hover:bg-stone-50 border h-10 gap-2 shadow-sm"
                : "bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl px-4 h-10 gap-2 shadow-sm"
            }
          >
            {editing ? (
              <><X className="w-4 h-4" /> Cancel</>
            ) : (
              <><Pencil className="w-4 h-4" /> Edit</>
            )}
          </Button>
        </div>
      </div>

      {/* Detail + Stats row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Contact details card */}
        <div className="rounded-2xl border border-stone-200 bg-white shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-stone-100 bg-stone-50">
            <h3 className="text-sm font-semibold text-stone-700">Contact details</h3>
          </div>
          <div className="px-6 py-4">
            {editing ? (
              <form onSubmit={handleSave} className="space-y-4">
                {[
                  { field: "name",           label: "Name",             type: "text"   },
                  { field: "contact_name",   label: "Contact name",     type: "text"   },
                  { field: "contact_email",  label: "Email",            type: "email"  },
                  { field: "contact_phone",  label: "Phone",            type: "text"   },
                  { field: "lead_time_days", label: "Lead time (days)", type: "number" },
                ].map(({ field, label, type }) => (
                  <div key={field} className="space-y-1.5">
                    <Label className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
                      {label}
                    </Label>
                    <Input
                      type={type}
                      value={form[field as keyof typeof form]}
                      onChange={(e) =>
                        setForm((prev) => ({ ...prev, [field]: e.target.value }))
                      }
                      className="rounded-xl border-stone-200 focus-visible:ring-emerald-500"
                    />
                  </div>
                ))}
                <div className="flex gap-3 pt-1">
                  <Button
                    type="submit"
                    disabled={saving}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl"
                  >
                    {saving ? "Saving..." : "Save changes"}
                  </Button>
                </div>
              </form>
            ) : (
              <div className="space-y-3">
                {[
                  { label: "Contact name", value: supplier.contact_name },
                  { label: "Email",        value: supplier.contact_email },
                  { label: "Phone",        value: supplier.contact_phone },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between text-sm py-1 border-b border-stone-50 last:border-0">
                    <span className="text-stone-400 font-medium">{label}</span>
                    <span className="text-stone-700">{value || "—"}</span>
                  </div>
                ))}
                <div className="flex justify-between text-sm py-1 items-center">
                  <span className="text-stone-400 font-medium">Lead time</span>
                  <Badge className="bg-emerald-50 text-emerald-700 hover:bg-emerald-50 border-0 gap-1.5">
                    <Truck className="w-3 h-3" />
                    {supplier.lead_time_days}d
                  </Badge>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Supply summary card */}
        <div className="rounded-2xl border border-stone-200 bg-white shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-stone-100 bg-stone-50">
            <h3 className="text-sm font-semibold text-stone-700">Supply summary</h3>
          </div>
          <div className="px-6 py-4 space-y-3">
            {[
              {
                label: "Total items supplied",
                value: totalItems,
                valueClass: "font-semibold text-stone-900",
              },
              {
                label: "Low stock items",
                value: lowStock,
                valueClass: `font-semibold ${lowStock > 0 ? "text-amber-600" : "text-stone-900"}`,
              },
              {
                label: "Out of stock items",
                value: outOfStock,
                valueClass: `font-semibold ${outOfStock > 0 ? "text-red-600" : "text-stone-900"}`,
              },
            ].map(({ label, value, valueClass }) => (
              <div key={label} className="flex justify-between text-sm py-1 border-b border-stone-50 last:border-0">
                <span className="text-stone-400 font-medium">{label}</span>
                <span className={valueClass}>{value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Items table */}
      <div className="rounded-2xl border border-stone-200 bg-white overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-stone-100 bg-stone-50">
          <h3 className="text-sm font-semibold text-stone-700">
            Items from {supplier.name}
          </h3>
        </div>
        <Table>
          <TableHeader>
            <TableRow className="bg-stone-50 hover:bg-stone-50 border-stone-200">
              <TableHead className="text-xs font-semibold text-stone-500 uppercase tracking-wider py-3.5">
                Name
              </TableHead>
              <TableHead className="text-xs font-semibold text-stone-500 uppercase tracking-wider py-3.5">
                Quantity
              </TableHead>
              <TableHead className="text-xs font-semibold text-stone-500 uppercase tracking-wider py-3.5">
                Unit
              </TableHead>
              <TableHead className="text-xs font-semibold text-stone-500 uppercase tracking-wider py-3.5">
                Status
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {!supplier.inventory_items?.length ? (
              <TableRow>
                <TableCell colSpan={4} className="py-16 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                      <Package className="w-5 h-5 text-emerald-400" />
                    </div>
                    <p className="text-stone-500 font-medium text-sm">No items linked</p>
                    <p className="text-stone-400 text-xs">
                      Inventory items assigned to this supplier will appear here
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              supplier.inventory_items.map((item) => {
                const status = statusConfig[item.status] ?? {
                  label: item.status.replace("_", " "),
                  className: "bg-stone-100 text-stone-600 hover:bg-stone-100 border-0",
                }
                return (
                  <TableRow
                    key={item.id}
                    className="border-stone-100 hover:bg-stone-50 transition-colors cursor-pointer"
                    onClick={() => router.push(`/inventory/${item.id}`)}
                  >
                    <TableCell>
                      <span className="font-semibold text-stone-900">{item.name}</span>
                    </TableCell>
                    <TableCell className="text-stone-600">{item.quantity}</TableCell>
                    <TableCell className="text-stone-600">{item.unit}</TableCell>
                    <TableCell>
                      <Badge className={status.className}>
                        {status.label}
                      </Badge>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
        {!!supplier.inventory_items?.length && (
          <div className="px-5 py-3 bg-stone-50 border-t border-stone-200 text-xs text-stone-400">
            {totalItems} item{totalItems !== 1 ? "s" : ""} supplied
          </div>
        )}
      </div>
    </div>
  )
}
