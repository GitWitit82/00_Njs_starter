import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { FormDependencyNode, FormStatusHistoryEntry } from '@/types/forms'
import { FormDependencyGraph } from './FormDependencyGraph'
import { FormStatusTimeline } from './FormStatusTimeline'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/components/ui/use-toast'
import { isValidStatusTransition } from '@/lib/utils/form-status'
import { BatchStatusUpdate } from './BatchStatusUpdate'

interface FormStatusOverviewProps {
  formId: string
  projectId: string
  initialStatus: string
  className?: string
}

/**
 * Component for managing and visualizing form status and dependencies
 */
export function FormStatusOverview({
  formId,
  projectId,
  initialStatus,
  className
}: FormStatusOverviewProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState('dependencies')
  const [loading, setLoading] = useState(false)
  const [nodes, setNodes] = useState<FormDependencyNode[]>([])
  const [history, setHistory] = useState<FormStatusHistoryEntry[]>([])
  const [newStatus, setNewStatus] = useState(initialStatus)
  const [statusComment, setStatusComment] = useState('')
  const [graphLayout, setGraphLayout] = useState<'hierarchical' | 'force-directed'>('hierarchical')

  // Fetch dependencies and history
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch dependencies
        const depResponse = await fetch(`/api/forms/instances/${formId}/dependencies`)
        if (depResponse.ok) {
          const depData = await depResponse.json()
          setNodes(depData.dependencyGraph || [])
        }

        // Fetch history
        const historyResponse = await fetch(`/api/forms/instances/${formId}/status`)
        if (historyResponse.ok) {
          const historyData = await historyResponse.json()
          setHistory(historyData)
        }
      } catch (error) {
        console.error('Error fetching form data:', error)
        toast({
          title: 'Error',
          description: 'Failed to load form data',
          variant: 'destructive'
        })
      }
    }

    fetchData()
  }, [formId, toast])

  // Handle status update
  const handleStatusUpdate = async () => {
    if (!isValidStatusTransition(initialStatus, newStatus)) {
      toast({
        title: 'Invalid Status Transition',
        description: `Cannot transition from ${initialStatus} to ${newStatus}`,
        variant: 'destructive'
      })
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`/api/forms/instances/${formId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status: newStatus,
          comments: statusComment,
          metadata: {
            updatedVia: 'FormStatusOverview',
            timestamp: new Date().toISOString()
          }
        })
      })

      if (!response.ok) {
        throw new Error('Failed to update status')
      }

      toast({
        title: 'Status Updated',
        description: 'Form status has been successfully updated'
      })

      // Refresh the page to show updated status
      router.refresh()
    } catch (error) {
      console.error('Error updating status:', error)
      toast({
        title: 'Error',
        description: 'Failed to update form status',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={className}>
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="dependencies">Dependencies</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
          <TabsTrigger value="status">Update Status</TabsTrigger>
          <TabsTrigger value="batch">Batch Update</TabsTrigger>
        </TabsList>

        <TabsContent value="dependencies">
          <Card className="p-4">
            <div className="mb-4 flex justify-end">
              <Select
                value={graphLayout}
                onValueChange={(value: 'hierarchical' | 'force-directed') => setGraphLayout(value)}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select layout" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hierarchical">Hierarchical</SelectItem>
                  <SelectItem value="force-directed">Force-Directed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <FormDependencyGraph
              nodes={nodes}
              currentFormId={formId}
              layout={graphLayout}
              onNodeClick={(nodeId) => {
                if (nodeId !== formId) {
                  router.push(`/forms/instances/${nodeId}`)
                }
              }}
            />
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <FormStatusTimeline history={history} />
        </TabsContent>

        <TabsContent value="status">
          <Card className="p-4 space-y-4">
            <div className="space-y-2">
              <h3 className="font-medium">Current Status</h3>
              <p className="text-sm text-gray-500">{initialStatus}</p>
            </div>

            <div className="space-y-2">
              <h3 className="font-medium">New Status</h3>
              <Select
                value={newStatus}
                onValueChange={setNewStatus}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select new status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                  <SelectItem value="PENDING_REVIEW">Pending Review</SelectItem>
                  <SelectItem value="COMPLETED">Completed</SelectItem>
                  <SelectItem value="ARCHIVED">Archived</SelectItem>
                  <SelectItem value="ON_HOLD">On Hold</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <h3 className="font-medium">Comments</h3>
              <Textarea
                value={statusComment}
                onChange={(e) => setStatusComment(e.target.value)}
                placeholder="Add comments about this status change..."
                className="min-h-[100px]"
              />
            </div>

            <Button
              onClick={handleStatusUpdate}
              disabled={loading || newStatus === initialStatus}
            >
              {loading ? 'Updating...' : 'Update Status'}
            </Button>
          </Card>
        </TabsContent>

        <TabsContent value="batch">
          <BatchStatusUpdate
            nodes={nodes}
            onUpdate={() => {
              // Refresh data after batch update
              router.refresh()
            }}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
} 