"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Formats a path segment to be more user-friendly
 * @param segment The URL segment to format
 * @returns Formatted segment string
 */
const formatSegment = (segment: string): string => {
  // Skip formatting for known route names
  if (['workflows', 'phases', 'tasks'].includes(segment)) {
    return segment.charAt(0).toUpperCase() + segment.slice(1);
  }
  
  // For IDs, try to find a more readable part or hide them
  if (segment.includes('cm5') || segment.length > 20) {
    return '';
  }

  return segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, " ");
};

/**
 * Breadcrumbs component that automatically generates navigation based on the current path
 * @returns JSX.Element representing the breadcrumb navigation
 */
const Breadcrumbs = () => {
  const pathname = usePathname();
  
  /**
   * Generates breadcrumb items from the current pathname
   * @returns Array of breadcrumb segments with their respective paths
   */
  const generateBreadcrumbs = () => {
    const segments = pathname
      .split("/")
      .filter((segment) => segment !== "");

    return segments.map((segment, index) => {
      const path = `/${segments.slice(0, index + 1).join("/")}`;
      const label = formatSegment(segment);
      
      // Skip empty labels (hidden IDs)
      if (!label) return null;
      
      return {
        label,
        path,
      };
    }).filter(Boolean); // Remove null items
  };

  const breadcrumbs = generateBreadcrumbs();

  if (pathname === "/") return null;

  return (
    <nav aria-label="Breadcrumb" className="py-2 px-4">
      <ol className="flex items-center space-x-2">
        <li>
          <Link
            href="/"
            className="text-gray-500 hover:text-gray-700 transition-colors"
            aria-label="Home"
          >
            <Home className="w-4 h-4" />
          </Link>
        </li>
        {breadcrumbs.map((breadcrumb, index) => (
          breadcrumb && (
            <li key={breadcrumb.path} className="flex items-center">
              <ChevronRight className="w-4 h-4 text-gray-400 mx-1" />
              <Link
                href={breadcrumb.path}
                className={cn(
                  "hover:text-gray-700 transition-colors",
                  index === breadcrumbs.length - 1
                    ? "text-gray-900 font-medium"
                    : "text-gray-500"
                )}
                aria-current={index === breadcrumbs.length - 1 ? "page" : undefined}
              >
                {breadcrumb.label}
              </Link>
            </li>
          )
        ))}
      </ol>
    </nav>
  );
};

export default Breadcrumbs; 