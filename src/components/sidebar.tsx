"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  CalendarIcon,
  FolderIcon,
  HomeIcon,
  UsersIcon,
  ClipboardIcon,
  LayersIcon,
  FormInputIcon,
  FileText,
  FileStack,
  Files,
  ChevronDown,
  ChevronRight,
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"

interface NavigationItem {
  name: string
  href: string
  icon: any
  subitems?: NavigationItem[]
}

const navigation: NavigationItem[] = [
  { name: "Dashboard", href: "/dashboard", icon: HomeIcon },
  { name: "Projects", href: "/projects", icon: FolderIcon },
  { name: "Workflows", href: "/workflows", icon: LayersIcon },
  { 
    name: "Forms", 
    href: "/forms", 
    icon: FormInputIcon,
    subitems: [
      { name: "Templates", href: "/forms/templates", icon: FileStack },
      { name: "Instances", href: "/forms/instances", icon: Files },
    ]
  },
  { name: "Tasks", href: "/tasks", icon: ClipboardIcon },
  { name: "Calendar", href: "/calendar", icon: CalendarIcon },
  { name: "Departments", href: "/departments", icon: UsersIcon },
]

/**
 * Main Sidebar component that can be collapsed
 */
export function Sidebar() {
  const pathname = usePathname()
  const [expandedItems, setExpandedItems] = useState<string[]>(["/forms"])

  const toggleExpand = (href: string) => {
    setExpandedItems(prev => 
      prev.includes(href) 
        ? prev.filter(r => r !== href)
        : [...prev, href]
    )
  }

  const renderNavigationItem = (item: NavigationItem) => {
    const hasSubitems = item.subitems && item.subitems.length > 0
    const isExpanded = expandedItems.includes(item.href)
    const isActive = pathname === item.href || pathname.startsWith(item.href + "/")

    return (
      <li key={item.name}>
        <Link
          href={hasSubitems ? "#" : item.href}
          onClick={hasSubitems ? (e) => {
            e.preventDefault()
            toggleExpand(item.href)
          } : undefined}
          className={cn(
            "group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold",
            isActive
              ? "bg-gray-50 text-primary"
              : "text-gray-700 hover:text-primary hover:bg-gray-50"
          )}
        >
          <item.icon
            className={cn(
              isActive
                ? "text-primary"
                : "text-gray-400 group-hover:text-primary",
              "h-6 w-6 shrink-0"
            )}
            aria-hidden="true"
          />
          <span className="flex-1">{item.name}</span>
          {hasSubitems && (
            <span className="flex items-center">
              {isExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </span>
          )}
        </Link>
        {hasSubitems && isExpanded && (
          <ul className="mt-1 space-y-1 pl-8">
            {item.subitems.map((subitem) => (
              <li key={subitem.name}>
                <Link
                  href={subitem.href}
                  className={cn(
                    "group flex gap-x-3 rounded-md p-2 text-sm leading-6",
                    pathname === subitem.href
                      ? "bg-gray-50 text-primary font-semibold"
                      : "text-gray-700 hover:text-primary hover:bg-gray-50"
                  )}
                >
                  <subitem.icon
                    className={cn(
                      pathname === subitem.href
                        ? "text-primary"
                        : "text-gray-400 group-hover:text-primary",
                      "h-5 w-5 shrink-0"
                    )}
                    aria-hidden="true"
                  />
                  {subitem.name}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </li>
    )
  }

  return (
    <div className="h-full border-r border-gray-200 bg-white">
      <div className="flex h-16 shrink-0 items-center px-6">
        <img
          className="h-8 w-auto"
          src="/logo.svg"
          alt="Workflow PMS"
        />
      </div>
      <nav className="flex flex-1 flex-col">
        <ul role="list" className="flex flex-1 flex-col gap-y-7 px-6 pb-4">
          <li>
            <ul role="list" className="-mx-2 space-y-1">
              {navigation.map(renderNavigationItem)}
            </ul>
          </li>
        </ul>
      </nav>
    </div>
  )
} 