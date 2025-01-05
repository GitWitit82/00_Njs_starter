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
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: HomeIcon },
  { name: "Projects", href: "/projects", icon: FolderIcon },
  { name: "Workflows", href: "/workflows", icon: LayersIcon },
  { name: "Forms", href: "/forms", icon: FormInputIcon },
  { name: "Tasks", href: "/tasks", icon: ClipboardIcon },
  { name: "Calendar", href: "/calendar", icon: CalendarIcon },
  { name: "Departments", href: "/departments", icon: UsersIcon },
]

/**
 * Main Sidebar component that can be collapsed
 */
export function Sidebar() {
  const pathname = usePathname()

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
              {navigation.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className={cn(
                      pathname === item.href
                        ? "bg-gray-50 text-primary"
                        : "text-gray-700 hover:text-primary hover:bg-gray-50",
                      "group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold"
                    )}
                  >
                    <item.icon
                      className={cn(
                        pathname === item.href
                          ? "text-primary"
                          : "text-gray-400 group-hover:text-primary",
                        "h-6 w-6 shrink-0"
                      )}
                      aria-hidden="true"
                    />
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </li>
        </ul>
      </nav>
    </div>
  )
} 