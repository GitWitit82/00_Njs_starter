import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

interface ProjectDetailField {
  id: string
  name: string
  label: string
  type?: string
  gridSpan?: number
}

interface ApprovalField {
  id: string
  name: string
  label: string
  type?: string
}

interface StandardFormTemplateProps {
  title: string
  departmentColor?: string
  projectDetails?: {
    enabled: boolean
    fields?: ProjectDetailField[]
  }
  description?: string
  children: React.ReactNode
  approval?: {
    enabled: boolean
    fields?: ApprovalField[]
  }
  headerControls?: React.ReactNode
  onDataChange?: (data: any) => void
}

/**
 * Standard form template component that provides consistent layout for all forms
 */
export function StandardFormTemplate({
  title,
  departmentColor = "#004B93",
  projectDetails = { enabled: true },
  description,
  children,
  approval = { enabled: false },
  headerControls,
  onDataChange,
}: StandardFormTemplateProps) {
  const [formData, setFormData] = useState<Record<string, any>>({})

  // Default project detail fields if none provided
  const defaultProjectFields: ProjectDetailField[] = [
    { id: "client", name: "client", label: "Client:", gridSpan: 2 },
    { id: "project", name: "project", label: "Project:", gridSpan: 2 },
    { id: "date", name: "date", label: "Date:", type: "date", gridSpan: 1 },
    { id: "vinNumber", name: "vinNumber", label: "VIN Number:", gridSpan: 1 },
    { id: "invoice", name: "invoice", label: "Invoice#:", gridSpan: 1 },
  ]

  // Default approval fields if none provided
  const defaultApprovalFields: ApprovalField[] = [
    { id: "approvedBy", name: "approvedBy", label: "Approved By:" },
    { id: "approvalDate", name: "approvalDate", label: "Date:", type: "date" },
  ]

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    const newData = { ...formData, [name]: value }
    setFormData(newData)
    onDataChange?.(newData)
  }

  const renderField = (field: ProjectDetailField | ApprovalField) => (
    <div
      key={field.id}
      className={field.gridSpan ? `col-span-${field.gridSpan}` : ""}
    >
      <label className="font-bold block mb-1">{field.label}</label>
      <input
        type={field.type || "text"}
        name={field.name}
        className="w-full border-b border-black bg-transparent"
        onChange={handleInputChange}
        value={formData[field.name] || ""}
      />
    </div>
  )

  return (
    <Card className="border-0 shadow-none">
      {/* Header */}
      <div
        className="flex justify-between items-center p-4"
        style={{ backgroundColor: departmentColor }}
      >
        <h1 className="text-2xl font-bold text-white">{title}</h1>
        {headerControls}
      </div>

      {/* Project Details Section */}
      {projectDetails.enabled && (
        <div className="p-4 space-y-4">
          <div className="grid grid-cols-4 gap-4">
            {(projectDetails.fields || defaultProjectFields).map(renderField)}
          </div>
        </div>
      )}

      {/* Description Section */}
      {description && (
        <div className="px-4 py-2">
          <p className="text-sm">{description}</p>
        </div>
      )}

      {/* Main Content Section */}
      <div className="p-4">{children}</div>

      {/* Approval Section */}
      {approval.enabled && (
        <div className="p-4 border-t">
          <div className="grid grid-cols-2 gap-4">
            {(approval.fields || defaultApprovalFields).map(renderField)}
          </div>
        </div>
      )}
    </Card>
  )
} 