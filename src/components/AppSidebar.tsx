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
import Image from "next/image"
import { NavItem } from "@/types/navigation"

interface AppSidebarProps {
  className?: string;
}

/**
 * Main application sidebar component
 * Combines navigation and role-based access control
 */
export function AppSidebar({ className }: AppSidebarProps) {
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

  const routes: NavItem[] = [
    {
      title: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
      label: "Dashboard",
    },
    {
      title: "Demo Layouts",
      href: "/demo-layouts",
      icon: LayoutTemplate,
      label: "Demo Layouts",
      subroutes: [
        {
          title: "Card-Based Layout",
          href: "/demo-layouts/card-based",
          icon: LayoutGrid,
          label: "Card-Based Layout",
        },
        {
          title: "Split Panel Layout",
          href: "/demo-layouts/split-panel",
          icon: Columns,
          label: "Split Panel Layout",
        },
        {
          title: "Kanban Board",
          href: "/demo-layouts/kanban",
          icon: Trello,
          label: "Kanban Board",
        },
      ],
    },
    {
      title: "Projects",
      href: "/projects",
      icon: FolderIcon,
      label: "Projects",
    },
    {
      title: "Workflows",
      href: "/workflows",
      icon: Workflow,
      label: "Workflows",
      show: isManager,
    },
    {
      title: "Forms",
      href: "/forms",
      icon: FileText,
      label: "Forms",
      show: isManager,
      subroutes: [
        {
          title: "Templates",
          href: "/forms/templates",
          icon: FileStack,
          label: "Templates",
        },
        {
          title: "Instances",
          href: "/forms/instances",
          icon: Files,
          label: "Instances",
        },
      ],
    },
    {
      title: "Tasks",
      href: "/tasks",
      icon: ClipboardIcon,
      label: "Tasks",
    },
    {
      title: "Calendar",
      href: "/calendar",
      icon: CalendarIcon,
      label: "Calendar",
    },
    {
      title: "Departments",
      href: "/departments",
      icon: Building2,
      label: "Departments",
      show: isManager,
    },
    {
      title: "Users",
      href: "/users",
      icon: Users,
      label: "Users",
      show: isAdmin,
    },
    {
      title: "Settings",
      href: "/settings",
      icon: Settings,
      label: "Settings",
    },
  ]

  const renderRoute = (route: NavItem, isSubroute = false) => {
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
      isCollapsed ? "w-[60px]" : "w-[240px]",
      className
    )}
    role="complementary"
    aria-label="Main sidebar"
    >
      <div className="flex h-16 items-center justify-between px-3 border-b">
        {!isCollapsed && (
          <Link href="/" className="flex items-center">
            <Image
              src="/logo.svg"
              alt="Workflow PMS"
              width={128}
              height={32}
              className="h-8 w-auto"
              priority
            />
          </Link>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9"
          onClick={() => setIsCollapsed(!isCollapsed)}
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          aria-expanded={!isCollapsed}
        >
          {isCollapsed ? <Menu className="h-4 w-4" aria-hidden="true" /> : <PanelLeftClose className="h-4 w-4" aria-hidden="true" />}
        </Button>
      </div>
      <nav className="flex-1 space-y-1 p-2" role="navigation" aria-label="Main navigation">
        {routes.map((route) => renderRoute(route))}
      </nav>
    </div>
  )
} 