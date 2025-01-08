'use client'

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { LiveFormBuilder } from "@/components/forms/LiveFormBuilder"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { useSession } from "next-auth/react"

interface Department {
  id: string
  name: string
  color: string
}

interface Workflow {
  id: string
  name: string
  phases: Array<{
    id: string
    name: string
  }>
}

export default function NewFormTemplatePage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [departments, setDepartments] = useState<Department[]>([])
  const [workflows, setWorkflows] = useState<Workflow[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Redirect if not authenticated
    if (status === 'unauthenticated') {
      router.push('/auth/login')
      return
    }

    const fetchData = async () => {
      try {
        const [deptResponse, workflowResponse] = await Promise.all([
          fetch('/api/departments', {
            headers: {
              'Content-Type': 'application/json',
            },
          }),
          fetch('/api/workflows', {
            headers: {
              'Content-Type': 'application/json',
            },
          })
        ])

        if (!deptResponse.ok || !workflowResponse.ok) {
          throw new Error('Failed to fetch required data')
        }

        const [deptData, workflowData] = await Promise.all([
          deptResponse.json(),
          workflowResponse.json()
        ])

        setDepartments(deptData)
        setWorkflows(workflowData)
      } catch (error) {
        toast.error('Failed to load required data')
        console.error('Data fetch error:', error)
      } finally {
        setIsLoading(false)
      }
    }

    if (status === 'authenticated') {
      fetchData()
    }
  }, [status, router])

  if (status === 'loading' || isLoading) {
    return (
      <div className="container mx-auto py-6">
        <div>Loading...</div>
      </div>
    )
  }

  if (status === 'unauthenticated') {
    return null // Will redirect in useEffect
  }

  const handleSave = async (data: any) => {
    try {
      // Basic validation before sending to API
      if (!data.name?.trim()) {
        toast.error('Form name is required')
        return
      }

      if (!data.departmentId) {
        toast.error('Department is required')
        return
      }

      if (!data.type) {
        toast.error('Form type is required')
        return
      }

      const response = await fetch('/api/forms/templates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          name: data.name.trim(),
          type: data.type || "FORM",
          sections: data.sections.map((section: any) => ({
            ...section,
            title: section.title.trim(),
            type: section.type || "FORM",
            items: section.items.map((item: any) => ({
              ...item,
              content: item.content.trim(),
              required: item.required || false,
              options: item.options || []
            }))
          }))
        }),
        credentials: 'include',
      })

      const responseData = await response.json()

      if (!response.ok) {
        if (response.status === 401) {
          toast.error('Session expired. Please log in again.')
          router.push('/auth/login')
          return
        }
        
        if (responseData.error === "Validation error") {
          // Display specific validation errors
          const errors = responseData.details.map((error: any) => 
            `${error.path.join('.')}: ${error.message}`
          ).join('\n')
          
          toast.error(
            <div>
              <p>Please fix the following errors:</p>
              <ul className="list-disc pl-4 mt-2">
                {responseData.details.map((error: any, index: number) => (
                  <li key={index}>{error.message}</li>
                ))}
              </ul>
            </div>
          )
          console.error("Validation errors:", errors)
          return
        }
        
        throw new Error(responseData.error || 'Failed to save form')
      }

      toast.success('Form saved successfully')
      router.push('/forms')
    } catch (error) {
      toast.error('Failed to save form')
      console.error('Save error:', error)
    }
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Create Form Template</h1>
          <p className="text-muted-foreground">Design a new form template for your workflow</p>
        </div>
        <Button variant="outline" onClick={() => router.push('/forms')}>
          Cancel
        </Button>
      </div>
      <LiveFormBuilder 
        departments={departments}
        workflows={workflows}
        onSave={handleSave}
      />
    </div>
  )
} 