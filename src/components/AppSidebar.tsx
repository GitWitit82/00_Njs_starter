"use client"

import * as React from "react"
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
  FolderIcon,
  CalendarIcon,
  ClipboardIcon,
  Menu,
  PanelLeftClose,
  LayoutTemplate,
  Columns,
  LayoutGrid,
  Trello,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface Route {
  href: string
  icon: any
  title: string
  label: string
  show?: boolean
  subroutes?: Route[]
}

/**
 * Main application sidebar component
 * Combines navigation and role-based access control
 */
export function AppSidebar() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const [expandedRoutes, setExpandedRoutes] = React.useState<string[]>([])
  const [isCollapsed, setIsCollapsed] = React.useState(true)

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
      href: "/demo-layouts",
      icon: LayoutTemplate,
      title: "Demo Layouts",
      label: "Demo Layouts",
      subroutes: [
        {
          href: "/demo-layouts/card-based",
          icon: LayoutGrid,
          title: "Card-Based Layout",
          label: "Card-Based Layout",
        },
        {
          href: "/demo-layouts/split-panel",
          icon: Columns,
          title: "Split Panel Layout",
          label: "Split Panel Layout",
        },
        {
          href: "/demo-layouts/kanban",
          icon: Trello,
          title: "Kanban Board",
          label: "Kanban Board",
        },
      ],
    },
    {
      href: "/projects",
      icon: FolderIcon,
      title: "Projects",
      label: "Projects",
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
      href: "/tasks",
      icon: ClipboardIcon,
      title: "Tasks",
      label: "Tasks",
    },
    {
      href: "/calendar",
      icon: CalendarIcon,
      title: "Calendar",
      label: "Calendar",
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
        <TooltipProvider delayDuration={0}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Link
                href={hasSubroutes ? "#" : route.href}
                onClick={hasSubroutes ? (e) => {
                  e.preventDefault()
                  toggleExpand(route.href)
                  if (isCollapsed) {
                    setIsCollapsed(false)
                  }
                } : undefined}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
                  isActive ? "bg-accent text-accent-foreground" : "text-muted-foreground",
                  isSubroute && !isCollapsed && "ml-6",
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
            </TooltipTrigger>
            {isCollapsed && (
              <TooltipContent side="right" className="min-w-[180px]">
                <div>
                  <div className="font-medium">{route.label}</div>
                  {hasSubroutes && (
                    <div className="mt-1 ml-4 space-y-1">
                      {route.subroutes?.map((subroute) => (
                        <Link
                          key={subroute.href}
                          href={subroute.href}
                          className="block text-sm text-muted-foreground hover:text-accent-foreground"
                        >
                          {subroute.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              </TooltipContent>
            )}
          </Tooltip>
        </TooltipProvider>
        {!isCollapsed && hasSubroutes && isExpanded && (
          <div className="mt-1">
            {route.subroutes?.map((subroute) => renderRoute(subroute, true))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className={cn(
      "relative flex h-screen flex-col border-r bg-background transition-all duration-300",
      isCollapsed ? "w-[60px]" : "w-[240px]"
    )}>
      <div className="flex h-16 items-center justify-between px-3 border-b">
        {!isCollapsed && (
          <img
            className="h-8 w-auto"
            src="/logo.svg"
            alt="Workflow PMS"
          />
        )}
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9"
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          {isCollapsed ? <Menu className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
        </Button>
      </div>
      <nav className="flex-1 space-y-1 p-2">
        {routes.map((route) => renderRoute(route))}
      </nav>
    </div>
  )
} 