import { LucideIcon } from "lucide-react"

/**
 * Base navigation item interface
 */
export interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
  label?: string;
  show?: boolean;
  disabled?: boolean;
  external?: boolean;
  subroutes?: NavItem[];
}

/**
 * Props for sidebar navigation components
 */
export interface SidebarNavProps {
  items: NavItem[];
  setOpen?: (open: boolean) => void;
  isCollapsed?: boolean;
} 