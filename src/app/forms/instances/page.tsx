import { Suspense } from "react"
import FormInstances from "../instances"

export default function FormInstancesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Form Instances</h1>
        <p className="text-muted-foreground">
          View and manage form instances across your projects
        </p>
      </div>

      <Suspense fallback={<div>Loading instances...</div>}>
        <FormInstances />
      </Suspense>
    </div>
  )
} 