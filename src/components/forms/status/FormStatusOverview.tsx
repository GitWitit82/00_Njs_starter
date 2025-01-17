'use client'

import { useState } from 'react'
import { FormInstance } from '@prisma/client'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'

interface FormStatusOverviewProps {
  instance: FormInstance
}

/**
 * FormStatusOverview component displays the current status of a form instance
 * and provides controls to update the status
 */
export function FormStatusOverview({ instance }: FormStatusOverviewProps) {
  const [status, setStatus] = useState(instance.status)
  const [isLoading, setIsLoading] = useState(false)

  const handleUpdateStatus = async (newStatus: string) => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/forms/instances/${instance.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) {
        throw new Error('Failed to update status')
      }

      setStatus(newStatus)
      toast.success('Status updated successfully')
    } catch (error) {
      console.error('Error updating status:', error)
      toast.error('Failed to update status')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex items-center gap-4">
      <Badge
        variant={status === 'COMPLETED' ? 'default' : 'secondary'}
        className="text-sm"
      >
        {status}
      </Badge>
      {status !== 'COMPLETED' && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleUpdateStatus('COMPLETED')}
          disabled={isLoading}
        >
          Mark as Complete
        </Button>
      )}
    </div>
  )
} 