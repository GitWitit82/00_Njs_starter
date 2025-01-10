import { useState } from "react"
import { StandardFormTemplate } from "./StandardFormTemplate"

interface ChecklistTask {
  id: string
  text: string
  isCompleted: boolean
}

interface HeaderOption {
  id: string
  label: string
  type: "checkbox" | "radio"
  color?: string
  options?: { id: string; label: string }[]
  onChange?: (value: any) => void
}

interface HeaderControl {
  id: string
  label: string
  type: "options" | "group"
  options?: HeaderOption[]
  controls?: HeaderControl[]
}

interface StandardChecklistProps {
  title: string
  departmentColor?: string
  description?: string
  tasks: ChecklistTask[]
  headerControls?: HeaderControl[]
  projectDetails?: {
    enabled: boolean
    fields?: any[]
  }
  approval?: {
    enabled: boolean
    fields?: any[]
  }
  onTaskComplete?: (taskId: string, isCompleted: boolean) => void
  onDataChange?: (data: any) => void
}

/**
 * Standard checklist component that provides consistent styling for all checklists
 */
export function StandardChecklist({
  title,
  departmentColor,
  description,
  tasks,
  headerControls = [],
  projectDetails,
  approval,
  onTaskComplete,
  onDataChange,
}: StandardChecklistProps) {
  const [checkedTasks, setCheckedTasks] = useState<string[]>([])
  const [headerData, setHeaderData] = useState<Record<string, any>>({})

  const handleTaskCheck = (taskId: string) => {
    setCheckedTasks((prev) => {
      const newChecked = prev.includes(taskId)
        ? prev.filter((id) => id !== taskId)
        : [...prev, taskId]
      onTaskComplete?.(taskId, !prev.includes(taskId))
      return newChecked
    })
  }

  const handleHeaderOptionChange = (controlId: string, optionId: string, value: any) => {
    const newData = {
      ...headerData,
      [controlId]: {
        ...headerData[controlId],
        [optionId]: value,
      },
    }
    setHeaderData(newData)
    onDataChange?.(newData)
  }

  const renderHeaderOption = (option: HeaderOption, controlId: string) => {
    if (option.type === "checkbox") {
      return (
        <label key={option.id} className="flex items-center gap-2">
          <input
            type="checkbox"
            className="h-5 w-5 border-2"
            checked={headerData[controlId]?.[option.id] || false}
            onChange={(e) =>
              handleHeaderOptionChange(controlId, option.id, e.target.checked)
            }
          />
          <span
            className={`font-bold ${
              option.color ? `text-${option.color}` : "text-white"
            }`}
          >
            {option.label}
          </span>
        </label>
      )
    }

    if (option.type === "radio" && option.options) {
      return (
        <div key={option.id} className="flex items-center gap-4">
          <span className="font-bold text-white">{option.label}:</span>
          {option.options.map((opt) => (
            <label key={opt.id} className="flex items-center gap-1">
              <input
                type="radio"
                className="h-4 w-4"
                name={`${controlId}-${option.id}`}
                checked={headerData[controlId]?.[option.id] === opt.id}
                onChange={() =>
                  handleHeaderOptionChange(controlId, option.id, opt.id)
                }
              />
              <span className="text-white">{opt.label}</span>
            </label>
          ))}
        </div>
      )
    }
  }

  const renderHeaderControl = (control: HeaderControl) => {
    if (control.type === "options" && control.options) {
      return (
        <div key={control.id} className="space-y-2">
          {control.options.map((option) =>
            renderHeaderOption(option, control.id)
          )}
        </div>
      )
    }

    if (control.type === "group" && control.controls) {
      return (
        <div key={control.id} className="space-y-2">
          <span className="font-bold text-white">{control.label}</span>
          <div className="flex gap-4">
            {control.controls.map(renderHeaderControl)}
          </div>
        </div>
      )
    }
  }

  return (
    <StandardFormTemplate
      title={title}
      departmentColor={departmentColor}
      description={description}
      projectDetails={projectDetails}
      approval={approval}
      headerControls={
        <div className="space-y-2">
          {headerControls.map(renderHeaderControl)}
        </div>
      }
      onDataChange={onDataChange}
    >
      <div className="mt-6">
        <div 
          className="text-white p-2 text-center font-bold"
          style={{ backgroundColor: departmentColor || "#000000" }}
        >
          TASKS
        </div>

        <div className="border border-black">
          {tasks.map((task, index) => (
            <div
              key={task.id}
              className="flex border-b border-black last:border-b-0"
            >
              <div className="w-12 p-2 border-r border-black text-center font-bold">
                {index + 1}
              </div>
              <div className="w-12 p-2 border-r border-black flex items-center justify-center">
                <div
                  onClick={() => handleTaskCheck(task.id)}
                  className={`w-6 h-6 border-2 border-black rounded-full cursor-pointer ${
                    checkedTasks.includes(task.id) ? "bg-black" : "bg-white"
                  }`}
                />
              </div>
              <div className="flex-1 p-2 text-sm">{task.text}</div>
            </div>
          ))}
        </div>
      </div>
    </StandardFormTemplate>
  )
} 