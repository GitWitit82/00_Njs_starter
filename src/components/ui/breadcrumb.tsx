import * as React from "react"
import Link from "next/link"
import { ChevronRight } from "lucide-react"

import { cn } from "@/lib/utils"

interface BreadcrumbItem {
  title: string
  href?: string
}

interface BreadcrumbProps {
  items: BreadcrumbItem[]
}

export function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav className="mb-4 flex items-center space-x-1 text-sm text-muted-foreground">
      {items.map((item, index) => {
        const isLast = index === items.length - 1
        return (
          <React.Fragment key={item.href || item.title}>
            {item.href ? (
              <Link
                href={item.href}
                className={cn(
                  "hover:text-foreground",
                  isLast && "text-foreground font-medium"
                )}
              >
                {item.title}
              </Link>
            ) : (
              <span className={cn(isLast && "text-foreground font-medium")}>
                {item.title}
              </span>
            )}
            {!isLast && (
              <ChevronRight className="h-4 w-4" />
            )}
          </React.Fragment>
        )
      })}
    </nav>
  )
} 