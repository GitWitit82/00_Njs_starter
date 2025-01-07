import { useState } from "react"
import { StandardChecklist } from "./StandardChecklist"

interface PrintChecklistData {
  headerControls: {
    printer?: string
    isLaminated?: boolean
    substrate?: string
    isMirrored?: boolean
    isFleet?: boolean
  }
  tasks: {
    id: string
    text: string
    isCompleted: boolean
  }[]
  projectDetails?: Record<string, any>
}

/**
 * Print checklist form component
 */
export function PrintChecklistForm() {
  const [formData, setFormData] = useState<PrintChecklistData>({
    headerControls: {},
    tasks: [
      {
        id: "1",
        text: "CONFIRMED PRINTER IS UP TO DATE WITH PREVENTATIVE MAINTENANCE",
        isCompleted: false,
      },
      {
        id: "2",
        text: "Performed a Full Print Optimization Process",
        isCompleted: false,
      },
      // Add more tasks as needed
    ],
  })

  const headerControls = [
    {
      id: "options",
      type: "options" as const,
      options: [
        {
          id: "mirrored",
          type: "checkbox",
          label: "Mirrored Graphical Items",
          color: "red-500",
        },
        {
          id: "fleet",
          type: "checkbox",
          label: "FLEET",
          color: "red-500",
        },
      ],
    },
    {
      id: "printer",
      type: "group" as const,
      label: "Printer Options",
      controls: [
        {
          id: "printerType",
          type: "options" as const,
          options: [
            {
              id: "printer",
              type: "radio",
              label: "PRINTER",
              options: [
                { id: "hp365", label: "HP365" },
                { id: "hp570", label: "HP570" },
              ],
            },
          ],
        },
        {
          id: "laminate",
          type: "options" as const,
          options: [
            {
              id: "isLaminated",
              type: "radio",
              label: "LAMINATE",
              options: [
                { id: "yes", label: "Yes" },
                { id: "no", label: "No" },
              ],
            },
          ],
        },
      ],
    },
    {
      id: "substrate",
      type: "group" as const,
      label: "Substrate Options",
      controls: [
        {
          id: "substrateType",
          type: "options" as const,
          options: [
            {
              id: "substrate",
              type: "radio",
              label: "SUBSTRATE",
              options: [
                { id: "avery1105", label: "Avery1105" },
                { id: "briteline", label: "Briteline" },
                { id: "perf", label: "Perf" },
                { id: "other", label: "Other" },
              ],
            },
          ],
        },
      ],
    },
  ]

  const handleDataChange = (data: any) => {
    setFormData((prev) => ({
      ...prev,
      ...data,
    }))
  }

  const handleTaskComplete = (taskId: string, isCompleted: boolean) => {
    setFormData((prev) => ({
      ...prev,
      tasks: prev.tasks.map((task) =>
        task.id === taskId ? { ...task, isCompleted } : task
      ),
    }))
  }

  return (
    <StandardChecklist
      title="PRINT CHECKLIST"
      departmentColor="#004B93"
      description="These steps MUST be completed & checked in this order before printing. Failure to do so may result in wasted vinyl & print time. All failures that result because of skipped steps will be the financial responsibility of the person hitting the 'print' button on the printer. TAKE YOUR TIME AND MAKE SURE THIS IS ALL CHECKED"
      tasks={formData.tasks}
      headerControls={headerControls}
      projectDetails={{ enabled: true }}
      approval={{ enabled: true }}
      onTaskComplete={handleTaskComplete}
      onDataChange={handleDataChange}
    />
  )
} 