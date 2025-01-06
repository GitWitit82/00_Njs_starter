import { Suspense } from "react"
import { Button } from "@/components/ui/button"
import { PlusIcon } from "lucide-react"
import Link from "next/link"
import FormTemplates from "./templates"

export default function FormsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Forms</h1>
          <p className="text-muted-foreground">
            Manage form templates and responses for your workflows
          </p>
        </div>
        <Link href="/forms/templates/new">
          <Button>
            <PlusIcon className="h-4 w-4 mr-2" />
            Create Template
          </Button>
        </Link>
      </div>

      <Suspense fallback={<div>Loading templates...</div>}>
        <FormTemplates />
      </Suspense>
    </div>
  )
} 