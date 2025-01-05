import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Forms",
  description: "Form management for workflow processes",
}

interface FormsLayoutProps {
  children: React.ReactNode
}

export default function FormsLayout({ children }: FormsLayoutProps) {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      {children}
    </div>
  )
} 