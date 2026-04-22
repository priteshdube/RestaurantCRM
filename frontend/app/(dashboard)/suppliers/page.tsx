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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Building2, Plus, Search, Truck } from "lucide-react"

type Supplier = {
  id: string
  name: string
  contact_name: string
  contact_email: string
  contact_phone: string
  lead_time_days: number
}

export default function SuppliersPage() {
  const router = useRouter()
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [filtered, setFiltered] = useState<Supplier[]>([])
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")

  const [form, setForm] = useState({
    name: "",
    contact_name: "",
    contact_email: "",
    contact_phone: "",
    lead_time_days: "3",
  })

  useEffect(() => {
    fetchSuppliers()
  }, [])

  useEffect(() => {
    if (!search) return setFiltered(suppliers)
    setFiltered(
      suppliers.filter((s) =>
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.contact_email?.toLowerCase().includes(search.toLowerCase())
      )
    )
  }, [search, suppliers])

  async function fetchSuppliers() {
    try {
      const res = await api.get("/api/suppliers/")
      setSuppliers(res.data)
      setFiltered(res.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  function handleChange(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setError("")
    try {
      await api.post("/api/suppliers/", {
        ...form,
        lead_time_days: parseInt(form.lead_time_days),
      })
      setDialogOpen(false)
      setForm({
        name: "",
        contact_name: "",
        contact_email: "",
        contact_phone: "",
        lead_time_days: "3",
      })
      fetchSuppliers()
    } catch (err) {
      setError("Failed to create supplier.")
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this supplier?")) return
    await api.delete(`/api/suppliers/${id}`)
    fetchSuppliers()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-[3px] border-emerald-500 border-t-transparent animate-spin" />
          <p className="text-emerald-600 text-sm font-medium">Loading suppliers...</p>
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
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-xs font-semibold text-emerald-600 uppercase tracking-widest">
              Supplier Management
            </span>
          </div>
          <h2 className="text-2xl font-bold text-stone-900">Suppliers</h2>
          <p className="text-sm text-stone-500 mt-1">
            {suppliers.length} active supplier{suppliers.length !== 1 ? "s" : ""}
          </p>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl px-4 h-10 gap-2 shadow-sm">
              <Plus className="w-4 h-4" />
              Add supplier
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-stone-900">Add new supplier</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-2">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
                  Name *
                </Label>
                <Input
                  required
                  value={form.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  placeholder="e.g. Fresh Farms Co."
                  className="rounded-xl border-stone-200 focus-visible:ring-emerald-500"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
                  Contact name
                </Label>
                <Input
                  value={form.contact_name}
                  onChange={(e) => handleChange("contact_name", e.target.value)}
                  placeholder="e.g. John Smith"
                  className="rounded-xl border-stone-200 focus-visible:ring-emerald-500"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
                  Contact email
                </Label>
                <Input
                  type="email"
                  value={form.contact_email}
                  onChange={(e) => handleChange("contact_email", e.target.value)}
                  placeholder="john@freshfarms.com"
                  className="rounded-xl border-stone-200 focus-visible:ring-emerald-500"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
                  Contact phone
                </Label>
                <Input
                  value={form.contact_phone}
                  onChange={(e) => handleChange("contact_phone", e.target.value)}
                  placeholder="+1 234 567 8900"
                  className="rounded-xl border-stone-200 focus-visible:ring-emerald-500"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
                  Lead time (days)
                </Label>
                <Input
                  type="number"
                  min="1"
                  value={form.lead_time_days}
                  onChange={(e) => handleChange("lead_time_days", e.target.value)}
                  className="rounded-xl border-stone-200 focus-visible:ring-emerald-500"
                />
              </div>
              {error && (
                <div className="flex items-start gap-2 rounded-xl bg-red-50 border border-red-100 px-3 py-2.5">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}
              <div className="flex gap-3 pt-2">
                <Button
                  type="submit"
                  disabled={submitting}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl"
                >
                  {submitting ? "Saving..." : "Save supplier"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-xl border-stone-200 text-stone-600"
                  onClick={() => setDialogOpen(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="relative max-w-sm w-full">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
        <Input
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 rounded-xl border-stone-200 focus-visible:ring-emerald-500"
        />
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-stone-200 bg-white overflow-hidden shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-stone-50 hover:bg-stone-50 border-stone-200">
              <TableHead className="text-xs font-semibold text-stone-500 uppercase tracking-wider py-3.5">
                Name
              </TableHead>
              <TableHead className="text-xs font-semibold text-stone-500 uppercase tracking-wider py-3.5">
                Contact
              </TableHead>
              <TableHead className="text-xs font-semibold text-stone-500 uppercase tracking-wider py-3.5">
                Email
              </TableHead>
              <TableHead className="text-xs font-semibold text-stone-500 uppercase tracking-wider py-3.5">
                Phone
              </TableHead>
              <TableHead className="text-xs font-semibold text-stone-500 uppercase tracking-wider py-3.5">
                Lead time
              </TableHead>
              <TableHead className="text-xs font-semibold text-stone-500 uppercase tracking-wider py-3.5">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="py-16 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                      <Building2 className="w-5 h-5 text-emerald-400" />
                    </div>
                    <p className="text-stone-500 font-medium text-sm">No suppliers found</p>
                    <p className="text-stone-400 text-xs">
                      {search ? "Try a different search term" : "Add your first supplier to get started"}
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((s) => (
                <TableRow key={s.id} className="border-stone-100 hover:bg-stone-50 transition-colors">
                  <TableCell>
                    <span className="font-semibold text-stone-900">{s.name}</span>
                  </TableCell>
                  <TableCell className="text-stone-600">{s.contact_name || "—"}</TableCell>
                  <TableCell className="text-stone-600">{s.contact_email || "—"}</TableCell>
                  <TableCell className="text-stone-600">{s.contact_phone || "—"}</TableCell>
                  <TableCell>
                    <Badge className="bg-emerald-50 text-emerald-700 hover:bg-emerald-50 border-0 gap-1.5">
                      <Truck className="w-3 h-3" />
                      {s.lead_time_days}d
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="rounded-lg border-stone-200 text-stone-600 hover:text-emerald-700 hover:border-emerald-300 hover:bg-emerald-50 h-8 text-xs"
                        onClick={() => router.push(`/suppliers/${s.id}`)}
                      >
                        View
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="rounded-lg border-red-100 text-red-500 hover:text-red-700 hover:bg-red-50 hover:border-red-200 h-8 text-xs"
                        onClick={() => handleDelete(s.id)}
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
            Showing {filtered.length} of {suppliers.length} supplier{suppliers.length !== 1 ? "s" : ""}
          </div>
        )}
      </div>
    </div>
  )
}
