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
  FileText,
  FileStack,
  Files,
  ChevronDown,
  ChevronRight,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useState } from "react"

interface SidebarNavProps {
  isCollapsed: boolean
}

interface Route {
  href: string
  icon: any
  title: string
  label: string
  show?: boolean
  subroutes?: Route[]
}

export function SidebarNav({ isCollapsed }: SidebarNavProps) {
  const pathname = usePathname()
  const { data: session } = useSession()
  const [expandedRoutes, setExpandedRoutes] = useState<string[]>(["/forms"])

  const isAdmin = session?.user?.role === "ADMIN"
  const isManager = isAdmin || session?.user?.role === "MANAGER"

  const toggleExpand = (href: string) => {
    setExpandedRoutes(prev => 
      prev.includes(href) 
        ? prev.filter(r => r !== href)
        : [...prev, href]
    )
  }

  const routes: Route[] = [
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
      href: "/forms",
      icon: FileText,
      title: "Forms",
      label: "Forms",
      show: isManager,
      subroutes: [
        {
          href: "/forms/templates",
          icon: FileStack,
          title: "Templates",
          label: "Templates",
        },
        {
          href: "/forms/instances",
          icon: Files,
          title: "Instances",
          label: "Instances",
        },
      ],
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

  const renderRoute = (route: Route, isSubroute = false) => {
    if (route.show === false) return null
    if (route.show !== undefined && !route.show) return null

    const isExpanded = expandedRoutes.includes(route.href)
    const isActive = pathname === route.href || pathname.startsWith(route.href + "/")
    const hasSubroutes = route.subroutes && route.subroutes.length > 0

    return (
      <div key={route.href}>
        <Link
          href={hasSubroutes ? "#" : route.href}
          onClick={hasSubroutes ? (e) => {
            e.preventDefault()
            toggleExpand(route.href)
          } : undefined}
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
            isActive ? "bg-accent text-accent-foreground" : "text-muted-foreground",
            isCollapsed && "justify-center",
            isSubroute && "ml-6",
          )}
        >
          <route.icon className="h-4 w-4" />
          {!isCollapsed && (
            <>
              <span className="flex-1">{route.label}</span>
              {hasSubroutes && (
                isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />
              )}
            </>
          )}
        </Link>
        {!isCollapsed && hasSubroutes && isExpanded && (
          <div className="mt-1">
            {route.subroutes?.map((subroute) => renderRoute(subroute, true))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div
      data-collapsed={isCollapsed}
      className="group flex flex-col gap-4 py-2 data-[collapsed=true]:py-2"
    >
      <nav className="grid gap-1 px-2">
        {routes.map((route) => renderRoute(route))}
      </nav>
    </div>
  )
} 