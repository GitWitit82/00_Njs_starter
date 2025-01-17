import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"

interface PrintChecklistFormProps {
  onSubmit: (data: FormData) => void
}

interface FormData {
  client: string
  project: string
  date: string
  vinNumber: string
  invoice: string
  tasks: {
    id: string
    label: string
    checked: boolean
  }[]
}

/**
 * PrintChecklistForm component for creating a printable checklist
 * @param {PrintChecklistFormProps} props - Component props
 * @returns {JSX.Element} Rendered component
 */
export function PrintChecklistForm({ onSubmit }: PrintChecklistFormProps) {
  const [formData, setFormData] = useState<FormData>({
    client: "",
    project: "",
    date: "",
    vinNumber: "",
    invoice: "",
    tasks: [
      { id: "1", label: "Check vehicle condition", checked: false },
      { id: "2", label: "Take photos of vehicle", checked: false },
      { id: "3", label: "Clean vehicle surface", checked: false },
      { id: "4", label: "Measure vehicle dimensions", checked: false },
      { id: "5", label: "Create design template", checked: false },
      { id: "6", label: "Print test sample", checked: false },
      { id: "7", label: "Apply vinyl wrap", checked: false },
      { id: "8", label: "Quality check", checked: false },
      { id: "9", label: "Final inspection", checked: false },
      { id: "10", label: "Client approval", checked: false },
    ],
  })

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleTaskToggle = (taskId: string) => {
    setFormData((prev) => ({
      ...prev,
      tasks: prev.tasks.map((task) =>
        task.id === taskId ? { ...task, checked: !task.checked } : task
      ),
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <Card className="p-6">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="client">Client Name</Label>
              <Input
                id="client"
                value={formData.client}
                onChange={(e) => handleInputChange("client", e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="project">Project Name</Label>
              <Input
                id="project"
                value={formData.project}
                onChange={(e) => handleInputChange("project", e.target.value)}
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => handleInputChange("date", e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="vinNumber">VIN Number</Label>
              <Input
                id="vinNumber"
                value={formData.vinNumber}
                onChange={(e) => handleInputChange("vinNumber", e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="invoice">Invoice Number</Label>
              <Input
                id="invoice"
                value={formData.invoice}
                onChange={(e) => handleInputChange("invoice", e.target.value)}
                required
              />
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Task Checklist</h3>
          <div className="grid gap-4">
            {formData.tasks.map((task) => (
              <div key={task.id} className="flex items-center space-x-2">
                <Checkbox
                  id={`task-${task.id}`}
                  checked={task.checked}
                  onCheckedChange={() => handleTaskToggle(task.id)}
                />
                <Label htmlFor={`task-${task.id}`}>{task.label}</Label>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </form>
  )
} 