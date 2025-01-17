"use client"

import { cn } from "@/lib/utils"
import { SidebarNav } from "@/components/sidebar-nav"
import Image from "next/image"
import { NavItem } from "@/types/navigation"

interface SidebarProps {
  className?: string
  items: NavItem[]
}

/**
 * Sidebar component for main navigation
 * @param {SidebarProps} props - Component props
 * @returns {JSX.Element} Rendered component
 */
export function Sidebar({ className, items }: SidebarProps) {
  return (
    <div className={cn("pb-12", className)}>
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <div className="mb-2 flex h-8 items-center justify-center">
            <Image
              src="/logo.svg"
              alt="Logo"
              width={128}
              height={32}
              priority
            />
          </div>
        </div>
        <SidebarNav items={items} />
      </div>
    </div>
  )
} 