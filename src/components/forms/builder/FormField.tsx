"use client"

import { useCallback } from "react"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

interface FormFieldProps {
  label: string
  value: Record<string, unknown>
  onChange: (value: Record<string, unknown>) => void
}

export function FormField({ label, value, onChange }: FormFieldProps) {
  const handleChange = useCallback(
    (event: React.ChangeEvent<HTMLTextAreaElement>) => {
      try {
        const parsed = JSON.parse(event.target.value)
        onChange(parsed)
      } catch (error) {
        console.error("Failed to parse JSON:", error)
      }
    },
    [onChange]
  )

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Textarea
        value={JSON.stringify(value, null, 2)}
        onChange={handleChange}
        className="font-mono"
        rows={10}
      />
    </div>
  )
} 