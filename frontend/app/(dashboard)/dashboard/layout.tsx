"use client"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { supabase } from "@/lib/supabase"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

const navItems = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Inventory", href: "/dashboard/inventory" },
  { label: "Suppliers", href: "/dashboard/suppliers" },
  { label: "Purchase Orders", href: "/dashboard/orders" },
  { label: "Alerts", href: "/dashboard/alerts" },
]

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const [userEmail, setUserEmail] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function checkAuth() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push("/signin")
        return
      }
      setUserEmail(session.user.email ?? "")
      setLoading(false)
    }
    checkAuth()
  }, [router])

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push("/login")
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r flex flex-col">
        {/* Logo */}
        <div className="p-6 border-b">
          <h1 className="text-xl font-bold text-gray-900">FresTrack</h1>
          <p className="text-xs text-gray-500 mt-1">Restaurant Inventory</p>
        </div>

        {/* Nav links */}
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "block px-4 py-2.5 rounded-lg text-sm font-medium transition-colors",
                pathname === item.href
                  ? "bg-gray-900 text-white"
                  : "text-gray-600 hover:bg-gray-100"
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* User + logout */}
        <div className="p-4 border-t">
          <p className="text-xs text-gray-500 truncate mb-2">{userEmail}</p>
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={handleLogout}
          >
            Sign out
          </Button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-8 overflow-auto">
        {children}
      </main>
    </div>
  )
}