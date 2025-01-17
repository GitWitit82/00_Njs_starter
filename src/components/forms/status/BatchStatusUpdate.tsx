import React, { useState } from 'react'
import { FormDependencyNode } from '@/types/forms'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/components/ui/use-toast'
import { Badge } from '@/components/ui/badge'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { FormInstanceStatus } from '@prisma/client'

interface BatchStatusUpdateProps {
  nodes: FormDependencyNode[]
  onUpdate: () => void
  className?: string
}

/**
 * Component for updating the status of multiple forms at once
 */
export function BatchStatusUpdate({
  nodes,
  onUpdate,
  className
}: BatchStatusUpdateProps) {
  const { toast } = useToast()
  const [selectedForms, setSelectedForms] = useState<string[]>([])
  const [newStatus, setNewStatus] = useState<FormInstanceStatus | ''>('')
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(false)

  // Handle form selection
  const handleSelectForm = (formInstanceId: string, checked: boolean) => {
    if (checked) {
      setSelectedForms(prev => [...prev, formInstanceId])
    } else {
      setSelectedForms(prev => prev.filter(id => id !== formInstanceId))
    }
  }

  // Handle select all
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedForms(nodes.map(node => node.formInstanceId))
    } else {
      setSelectedForms([])
    }
  }

  // Handle batch update
  const handleBatchUpdate = async () => {
    if (!newStatus || selectedForms.length === 0) {
      toast({
        title: 'Validation Error',
        description: 'Please select forms and a new status',
        variant: 'destructive'
      })
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/forms/instances/batch-status', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          formIds: selectedForms,
          status: newStatus,
          comment,
          metadata: {
            updatedVia: 'BatchStatusUpdate',
            timestamp: new Date().toISOString()
          }
        })
      })

      if (!response.ok) {
        throw new Error('Failed to update statuses')
      }

      toast({
        title: 'Success',
        description: `Updated status for ${selectedForms.length} forms`
      })

      // Reset form
      setSelectedForms([])
      setNewStatus('')
      setComment('')
      onUpdate()
    } catch (error) {
      console.error('Error updating statuses:', error)
      toast({
        title: 'Error',
        description: 'Failed to update form statuses',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className={cn("p-4", className)}>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">Batch Status Update</h3>
          <div className="flex items-center gap-2">
            <Checkbox
              checked={selectedForms.length === nodes.length}
              onCheckedChange={handleSelectAll}
              id="select-all"
            />
            <label
              htmlFor="select-all"
              className="text-sm text-muted-foreground"
            >
              Select All
            </label>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 max-h-[300px] overflow-y-auto">
          <AnimatePresence>
            {nodes.map((node) => (
              <motion.div
                key={node.formInstanceId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="flex items-start gap-2 p-2 border rounded-md"
              >
                <Checkbox
                  checked={selectedForms.includes(node.formInstanceId)}
                  onCheckedChange={(checked) => handleSelectForm(node.formInstanceId, !!checked)}
                  id={node.formInstanceId}
                />
                <div className="flex-1 min-w-0">
                  <label
                    htmlFor={node.formInstanceId}
                    className="block text-sm font-medium truncate"
                  >
                    {node.formName}
                  </label>
                  <Badge
                    variant="secondary"
                    className="mt-1"
                  >
                    {node.status}
                  </Badge>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        <div className="space-y-4 pt-4 border-t">
          <div className="space-y-2">
            <label className="text-sm font-medium">New Status</label>
            <Select
              value={newStatus}
              onValueChange={(value) => setNewStatus(value as FormInstanceStatus)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select new status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={FormInstanceStatus.ACTIVE}>Active</SelectItem>
                <SelectItem value={FormInstanceStatus.IN_PROGRESS}>In Progress</SelectItem>
                <SelectItem value={FormInstanceStatus.PENDING_REVIEW}>Pending Review</SelectItem>
                <SelectItem value={FormInstanceStatus.COMPLETED}>Completed</SelectItem>
                <SelectItem value={FormInstanceStatus.ARCHIVED}>Archived</SelectItem>
                <SelectItem value={FormInstanceStatus.ON_HOLD}>On Hold</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Comment</label>
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Add a comment for all selected forms..."
              className="min-h-[100px]"
            />
          </div>

          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {selectedForms.length} forms selected
            </p>
            <Button
              onClick={handleBatchUpdate}
              disabled={loading || selectedForms.length === 0 || !newStatus}
            >
              {loading ? 'Updating...' : 'Update Selected Forms'}
            </Button>
          </div>
        </div>
      </div>
    </Card>
  )
} 