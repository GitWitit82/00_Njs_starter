'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Plus } from 'lucide-react'

interface FormVersionCreateProps {
  onSubmit: (notes: string) => Promise<void>
  isLoading?: boolean
}

/**
 * FormVersionCreate component for creating new versions
 * @param {FormVersionCreateProps} props - Component props
 * @returns {JSX.Element} Rendered component
 */
export function FormVersionCreate({
  onSubmit,
  isLoading = false,
}: FormVersionCreateProps) {
  const [open, setOpen] = useState(false)
  const [notes, setNotes] = useState('')

  const handleSubmit = async () => {
    if (!notes.trim()) return

    try {
      await onSubmit(notes.trim())
      setNotes('')
      setOpen(false)
    } catch {
      // Error is handled by the parent component
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button disabled={isLoading} aria-label="Create new version">
          <Plus className="mr-2 h-4 w-4" />
          Create Version
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Version</DialogTitle>
          <DialogDescription>
            Add notes to describe the changes in this version.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          <Label htmlFor="version-notes">Version Notes</Label>
          <Textarea
            id="version-notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Describe your changes..."
            className="min-h-[100px]"
            disabled={isLoading}
            required
          />
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isLoading || !notes.trim()}
            aria-label="Create version"
          >
            {isLoading ? 'Creating...' : 'Create'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 