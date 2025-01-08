"use client"

import { useRouter } from "next/navigation"
import { FormBuilder } from "@/components/forms/FormBuilder"
import { FormType } from "@prisma/client"
import { toast } from "sonner"
import { useEffect, useState } from "react"

interface Department {
  id: string
  name: string
  color: string
}

interface Phase {
  id: string
  name: string
}

interface Workflow {
  id: string
  name: string
  description?: string | null
  phases: Phase[]
  createdAt: Date
  updatedAt: Date
}

/**
 * Form Builder Page
 * Allows users to create new form templates
 */
export default function FormBuilderPage() {
  const router = useRouter()
  const [departments, setDepartments] = useState<Department[]>([])
  const [workflows, setWorkflows] = useState<Workflow[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch departments
        const deptResponse = await fetch("/api/departments")
        if (!deptResponse.ok) throw new Error("Failed to fetch departments")
        const deptData = await deptResponse.json()
        setDepartments(deptData)

        // Fetch workflows
        const workflowResponse = await fetch("/api/workflows")
        if (!workflowResponse.ok) throw new Error("Failed to fetch workflows")
        const workflowData = await workflowResponse.json()
        setWorkflows(workflowData)
      } catch (error) {
        toast.error("Failed to load required data")
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="max-w-2xl mx-auto">
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Create Form Template</h1>
        <FormBuilder 
          departments={departments}
          workflows={workflows}
          initialData={null}
        />
      </div>
    </div>
  )
} 