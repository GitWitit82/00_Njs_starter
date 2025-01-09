import React, { useCallback, useEffect, useRef, useState } from 'react'
import { FormDependencyNode } from '@/types/forms'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import ForceGraph2D from 'react-force-graph-2d'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, ZoomIn, ZoomOut, RefreshCw } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface FormDependencyGraphProps {
  nodes: FormDependencyNode[]
  currentFormId?: string
  onNodeClick?: (nodeId: string) => void
  layout?: 'hierarchical' | 'force-directed'
}

/**
 * Component for visualizing form dependencies in a graph structure
 * Supports both hierarchical and force-directed layouts with interactive features
 */
export function FormDependencyGraph({
  nodes,
  currentFormId,
  onNodeClick,
  layout = 'hierarchical'
}: FormDependencyGraphProps) {
  const graphRef = useRef<any>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [filteredNodes, setFilteredNodes] = useState(nodes)

  // Filter nodes based on search term and status
  useEffect(() => {
    let filtered = nodes
    
    if (searchTerm) {
      filtered = filtered.filter(node => 
        node.formName.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }
    
    if (statusFilter !== 'all') {
      filtered = filtered.filter(node => node.status === statusFilter)
    }
    
    setFilteredNodes(filtered)
  }, [nodes, searchTerm, statusFilter])

  // Get status color
  const getStatusColor = (status: string) => {
    const colors = {
      ACTIVE: 'bg-blue-500',
      IN_PROGRESS: 'bg-yellow-500',
      PENDING_REVIEW: 'bg-purple-500',
      COMPLETED: 'bg-green-500',
      ARCHIVED: 'bg-gray-500',
      ON_HOLD: 'bg-red-500'
    }
    return colors[status as keyof typeof colors] || 'bg-gray-500'
  }

  // Zoom controls
  const handleZoomIn = () => {
    if (graphRef.current) {
      const currentZoom = graphRef.current.zoom()
      graphRef.current.zoom(currentZoom * 1.5, 400)
    }
  }

  const handleZoomOut = () => {
    if (graphRef.current) {
      const currentZoom = graphRef.current.zoom()
      graphRef.current.zoom(currentZoom / 1.5, 400)
    }
  }

  const handleResetZoom = () => {
    if (graphRef.current) {
      graphRef.current.zoomToFit(400)
    }
  }

  // Prepare data for force-directed graph
  const graphData = useCallback(() => {
    const graphNodes = filteredNodes.map(node => ({
      id: node.formId,
      name: node.formName,
      status: node.status,
      isBlocking: node.isBlocking,
      order: node.order || 0
    }))

    const graphLinks = filteredNodes.flatMap(node =>
      node.dependencies
        .filter(depId => filteredNodes.some(n => n.formId === depId))
        .map(depId => ({
          source: node.formId,
          target: depId,
          completed: filteredNodes.find(n => n.formId === depId)?.status === 'COMPLETED'
        }))
    )

    return { nodes: graphNodes, links: graphLinks }
  }, [filteredNodes])

  // Force-directed graph configuration
  const handleNodeClick = useCallback((node: any) => {
    onNodeClick?.(node.id)
  }, [onNodeClick])

  if (layout === 'force-directed') {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search forms..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>
          <Select
            value={statusFilter}
            onValueChange={setStatusFilter}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="ACTIVE">Active</SelectItem>
              <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
              <SelectItem value="PENDING_REVIEW">Pending Review</SelectItem>
              <SelectItem value="COMPLETED">Completed</SelectItem>
              <SelectItem value="ARCHIVED">Archived</SelectItem>
              <SelectItem value="ON_HOLD">On Hold</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={handleZoomIn}
              title="Zoom in"
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={handleZoomOut}
              title="Zoom out"
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={handleResetZoom}
              title="Reset zoom"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="w-full h-[600px] border rounded-lg overflow-hidden">
          <ForceGraph2D
            ref={graphRef}
            graphData={graphData()}
            nodeLabel="name"
            nodeColor={node => {
              const statusColors = {
                ACTIVE: '#3b82f6',
                IN_PROGRESS: '#eab308',
                PENDING_REVIEW: '#a855f7',
                COMPLETED: '#22c55e',
                ARCHIVED: '#6b7280',
                ON_HOLD: '#ef4444'
              }
              return statusColors[node.status as keyof typeof statusColors] || '#6b7280'
            }}
            linkColor={link => link.completed ? '#22c55e' : '#94a3b8'}
            linkWidth={2}
            nodeRelSize={8}
            onNodeClick={handleNodeClick}
            cooldownTicks={50}
            d3VelocityDecay={0.1}
            onEngineStop={() => {
              if (graphRef.current) {
                graphRef.current.zoomToFit(400)
              }
            }}
          />
        </div>
      </div>
    )
  }

  // Group nodes by their completion order for hierarchical layout
  const groupedNodes = nodes.reduce((acc, node) => {
    const order = node.order || 0
    if (!acc[order]) acc[order] = []
    acc[order].push(node)
    return acc
  }, {} as Record<number, FormDependencyNode[]>)

  return (
    <div className="w-full overflow-x-auto">
      <div className="min-w-[800px] p-4">
        <div className="flex flex-col gap-8">
          {Object.entries(groupedNodes).map(([order, levelNodes]) => (
            <div key={order} className="flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <div className="h-px flex-1 bg-gray-200" />
                <span className="text-sm text-gray-500">Level {order}</span>
                <div className="h-px flex-1 bg-gray-200" />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <AnimatePresence>
                  {levelNodes.map((node) => (
                    <motion.div
                      key={node.formId}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Card
                        className={cn(
                          "p-4 cursor-pointer transition-all hover:shadow-lg transform hover:-translate-y-1",
                          currentFormId === node.formId && "ring-2 ring-primary"
                        )}
                        onClick={() => onNodeClick?.(node.formId)}
                      >
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.1 }}
                          className="flex items-start justify-between mb-2"
                        >
                          <h3 className="font-medium">{node.formName}</h3>
                          <motion.div
                            initial={{ scale: 0.8 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 200 }}
                          >
                            <Badge
                              variant="secondary"
                              className={cn("ml-2", getStatusColor(node.status))}
                            >
                              {node.status}
                            </Badge>
                          </motion.div>
                        </motion.div>

                        {node.dependencies.length > 0 && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="mt-2"
                          >
                            <p className="text-sm text-gray-500 mb-1">Dependencies:</p>
                            <div className="flex flex-wrap gap-1">
                              {node.dependencies.map(depId => {
                                const depNode = nodes.find(n => n.formId === depId)
                                return (
                                  <Badge
                                    key={depId}
                                    variant="outline"
                                    className={cn(
                                      "text-xs",
                                      depNode?.status === "COMPLETED" 
                                        ? "bg-green-100" 
                                        : "bg-yellow-100"
                                    )}
                                  >
                                    {depNode?.formName || 'Unknown Form'}
                                  </Badge>
                                )
                              })}
                            </div>
                          </motion.div>
                        )}

                        {node.isBlocking && (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                          >
                            <Badge variant="destructive" className="mt-2">
                              Blocking
                            </Badge>
                          </motion.div>
                        )}
                      </Card>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
} 