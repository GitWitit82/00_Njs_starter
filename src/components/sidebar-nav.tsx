"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSession } from "next-auth/react"
import {
  LayoutDashboard,
  Settings,
  Users,
  Workflow,
  Building2,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface SidebarNavProps {
  isCollapsed: boolean
}

export function SidebarNav({ isCollapsed }: SidebarNavProps) {
  const pathname = usePathname()
  const { data: session } = useSession()

  const isAdmin = session?.user?.role === "ADMIN"
  const isManager = isAdmin || session?.user?.role === "MANAGER"

  const routes = [
    {
      href: "/dashboard",
      icon: LayoutDashboard,
      title: "Dashboard",
      label: "Dashboard",
    },
    {
      href: "/workflows",
      icon: Workflow,
      title: "Workflows",
      label: "Workflows",
      show: isManager,
    },
    {
      href: "/departments",
      icon: Building2,
      title: "Departments",
      label: "Departments",
      show: isManager,
    },
    {
      href: "/users",
      icon: Users,
      title: "Users",
      label: "Users",
      show: isAdmin,
    },
    {
      href: "/settings",
      icon: Settings,
      title: "Settings",
      label: "Settings",
    },
  ]

  return (
    <div
      data-collapsed={isCollapsed}
      className="group flex flex-col gap-4 py-2 data-[collapsed=true]:py-2"
    >
      <nav className="grid gap-1 px-2">
        {routes.map((route) => {
          if (route.show === false) return null
          if (route.show !== undefined && !route.show) return null

          return (
            <Link
              key={route.href}
              href={route.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
                pathname === route.href
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground",
                isCollapsed && "justify-center"
              )}
            >
              <route.icon className="h-4 w-4" />
              {!isCollapsed && <span>{route.label}</span>}
            </Link>
          )
        })}
      </nav>
    </div>
  )
} 