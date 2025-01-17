"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { NavItem } from "@/types/navigation"

interface SidebarNavProps {
  items: NavItem[]
  isCollapsed?: boolean
}

/**
 * SidebarNav component for displaying navigation items
 * @param {SidebarNavProps} props - Component props
 * @returns {JSX.Element} Rendered component
 */
export function SidebarNav({ items, isCollapsed = false }: SidebarNavProps) {
  return (
    <ScrollArea
      className="h-full"
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="space-y-1 p-2">
        {items.map((item) => (
          <Button
            key={item.href}
            variant="ghost"
            asChild
            className={cn(
              "w-full justify-start",
              isCollapsed && "h-9 w-9 p-0 justify-center"
            )}
            aria-current={item.href === window.location.pathname ? "page" : undefined}
          >
            <a
              href={item.href}
              className={cn(
                "flex items-center gap-3",
                isCollapsed && "h-9 w-9 p-0 justify-center"
              )}
            >
              {item.icon && (
                <item.icon
                  className={cn("h-4 w-4", isCollapsed && "h-5 w-5")}
                  aria-hidden="true"
                />
              )}
              {!isCollapsed && <span>{item.title}</span>}
            </a>
          </Button>
        ))}
      </div>
    </ScrollArea>
  )
} 