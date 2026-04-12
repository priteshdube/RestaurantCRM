"use client"

import { useEffect, useState } from "react"
import api from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
  DialogFooter,
} from "@/components/ui/dialog"

type Supplier = {
  id: string
  name: string
  contact_name: string | null
  email: string | null
  phone: string | null
  address: string | null
}

const emptyForm = {
  name: "",
  contact_name: "",
  email: "",
  phone: "",
  address: "",
}

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [filtered, setFiltered] = useState<Supplier[]>([])
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    fetchSuppliers()
  }, [])

  useEffect(() => {
    if (!search) {
      setFiltered(suppliers)
    } else {
      setFiltered(
        suppliers.filter(
          (s) =>
            s.name.toLowerCase().includes(search.toLowerCase()) ||
            s.email?.toLowerCase().includes(search.toLowerCase()) ||
            s.contact_name?.toLowerCase().includes(search.toLowerCase())
        )
      )
    }
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

  async function handleCreate(e: { preventDefault(): void }) {
    e.preventDefault()
    setSaving(true)
    setError("")
    try {
      await api.post("/api/suppliers/", {
        name: form.name,
        contact_name: form.contact_name || undefined,
        email: form.email || undefined,
        phone: form.phone || undefined,
        address: form.address || undefined,
      })
      setDialogOpen(false)
      setForm(emptyForm)
      fetchSuppliers()
    } catch {
      setError("Failed to create supplier.")
    } finally {
      setSaving(false)
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
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
            <span className="text-xs font-semibold text-emerald-600 uppercase tracking-widest">
              Vendor Management
            </span>
          </div>
          <h2 className="text-2xl font-bold text-stone-900">Suppliers</h2>
          <p className="text-sm text-stone-500 mt-1">{suppliers.length} total suppliers</p>
        </div>
        <Button
          onClick={() => { setForm(emptyForm); setError(""); setDialogOpen(true) }}
          className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl px-4 h-10 gap-2 shadow-sm"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add supplier
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400"
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <Input
          placeholder="Search by name, contact, or email..."
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
              <TableHead className="text-xs font-semibold text-stone-500 uppercase tracking-wider py-3.5">Name</TableHead>
              <TableHead className="text-xs font-semibold text-stone-500 uppercase tracking-wider py-3.5">Contact</TableHead>
              <TableHead className="text-xs font-semibold text-stone-500 uppercase tracking-wider py-3.5">Email</TableHead>
              <TableHead className="text-xs font-semibold text-stone-500 uppercase tracking-wider py-3.5">Phone</TableHead>
              <TableHead className="text-xs font-semibold text-stone-500 uppercase tracking-wider py-3.5">Address</TableHead>
              <TableHead className="text-xs font-semibold text-stone-500 uppercase tracking-wider py-3.5">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="py-16 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                      <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <p className="text-stone-500 font-medium text-sm">No suppliers found</p>
                    <p className="text-stone-400 text-xs">
                      {suppliers.length === 0 ? "Add your first supplier to get started." : "Try adjusting your search."}
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((s) => (
                <TableRow key={s.id} className="border-stone-100 hover:bg-stone-50 transition-colors group">
                  <TableCell className="font-semibold text-stone-900 group-hover:text-emerald-700 transition-colors">
                    {s.name}
                  </TableCell>
                  <TableCell className="text-stone-600">
                    {s.contact_name ?? <span className="text-stone-300">—</span>}
                  </TableCell>
                  <TableCell className="text-stone-600 text-sm">
                    {s.email ?? <span className="text-stone-300">—</span>}
                  </TableCell>
                  <TableCell className="text-stone-600 text-sm">
                    {s.phone ?? <span className="text-stone-300">—</span>}
                  </TableCell>
                  <TableCell className="text-stone-500 text-sm max-w-[200px] truncate">
                    {s.address ?? <span className="text-stone-300">—</span>}
                  </TableCell>
                  <TableCell>
                    <Button
                      size="sm"
                      variant="outline"
                      className="rounded-lg border-red-100 text-red-500 hover:text-red-700 hover:bg-red-50 hover:border-red-200 h-8 text-xs"
                      onClick={() => handleDelete(s.id)}
                    >
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        {filtered.length > 0 && (
          <div className="px-5 py-3 bg-stone-50 border-t border-stone-200 text-xs text-stone-400">
            Showing {filtered.length} of {suppliers.length} suppliers
          </div>
        )}
      </div>

      {/* Add supplier dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="rounded-2xl max-w-md">
          <DialogHeader>
            <DialogTitle className="text-stone-900">Add supplier</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4 pt-1">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Name *</Label>
              <Input
                required
                value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                placeholder="e.g. Fresh Farms Co."
                className="rounded-xl border-stone-200 focus-visible:ring-emerald-500"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Contact name</Label>
              <Input
                value={form.contact_name}
                onChange={(e) => setForm((p) => ({ ...p, contact_name: e.target.value }))}
                placeholder="e.g. John Smith"
                className="rounded-xl border-stone-200 focus-visible:ring-emerald-500"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Email</Label>
                <Input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                  placeholder="contact@supplier.com"
                  className="rounded-xl border-stone-200 focus-visible:ring-emerald-500"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Phone</Label>
                <Input
                  value={form.phone}
                  onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
                  placeholder="+1 555 000 0000"
                  className="rounded-xl border-stone-200 focus-visible:ring-emerald-500"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Address</Label>
              <Input
                value={form.address}
                onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))}
                placeholder="123 Main St, City, State"
                className="rounded-xl border-stone-200 focus-visible:ring-emerald-500"
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
            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
                className="rounded-xl border-stone-200 text-stone-600 hover:bg-stone-50"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={saving}
                className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl gap-2"
              >
                {saving ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    Saving...
                  </>
                ) : "Add supplier"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
