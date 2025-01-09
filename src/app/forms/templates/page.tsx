import { Suspense } from "react"
import { Button } from "@/components/ui/button"
import { PlusIcon } from "lucide-react"
import Link from "next/link"
import FormTemplates from "../templates"

export default function FormTemplatesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Form Templates</h1>
          <p className="text-muted-foreground">
            Create and manage form templates for your workflows
          </p>
        </div>
        <div className="space-x-2">
          <Link href="/forms/templates/new">
            <Button>
              <PlusIcon className="h-4 w-4 mr-2" />
              Create Template
            </Button>
          </Link>
        </div>
      </div>

      <Suspense fallback={<div>Loading templates...</div>}>
        <FormTemplates />
      </Suspense>
    </div>
  )
} 