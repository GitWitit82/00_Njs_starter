"use client"

import { useState } from "react"
import { Department } from "@prisma/client"
import { Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { DepartmentModal } from "@/components/departments/department-modal"
import { DepartmentsTable } from "@/components/departments/departments-table"

interface DepartmentsClientProps {
  initialDepartments: Department[]
}

export function DepartmentsClient({ initialDepartments }: DepartmentsClientProps) {
  const [departments, setDepartments] = useState<Department[]>(initialDepartments)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(
    null
  )

  const fetchDepartments = async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/departments")
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to fetch departments")
      }
      const data = await response.json()
      setDepartments(data)
    } catch (error) {
      console.error("Error:", error)
      setError(error instanceof Error ? error.message : "Failed to load departments")
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateClick = () => {
    setSelectedDepartment(null)
    setIsModalOpen(true)
  }

  const handleEditClick = (department: Department) => {
    setSelectedDepartment(department)
    setIsModalOpen(true)
  }

  const handleDeleteClick = async (id: string) => {
    if (!confirm("Are you sure you want to delete this department?")) return

    try {
      const response = await fetch(`/api/departments/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to delete department")
      }

      await fetchDepartments()
    } catch (error) {
      console.error("Error:", error)
      setError(error instanceof Error ? error.message : "Failed to delete department")
    }
  }

  const handleModalSuccess = () => {
    setIsModalOpen(false)
    fetchDepartments()
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Departments</h1>
        <Button onClick={handleCreateClick}>
          <Plus className="mr-2 h-4 w-4" />
          New Department
        </Button>
      </div>

      {error && (
        <div className="mt-4 rounded-md bg-destructive/15 p-4 text-destructive">
          {error}
        </div>
      )}

      <div className="mt-6">
        <DepartmentsTable
          departments={departments}
          isLoading={isLoading}
          onEdit={handleEditClick}
          onDelete={handleDeleteClick}
        />
      </div>

      <DepartmentModal
        department={selectedDepartment}
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        onSuccess={handleModalSuccess}
      />
    </div>
  )
} 