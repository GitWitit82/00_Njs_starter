import { useState, useEffect } from "react"
import { FormDependencyNode } from "@/types/forms"
import { Button } from "@/components/ui/button"

interface GraphData {
  nodes: Array<{
    id: string
    name: string
    status: string
    x?: number
    y?: number
  }>
  links: Array<{
    source: { x?: number; y?: number }
    target: { x?: number; y?: number }
  }>
}

interface FormDependencyGraphProps {
  dependencies: FormDependencyNode[]
}

/**
 * FormDependencyGraph component for visualizing form dependencies
 * @param {FormDependencyGraphProps} props - Component props
 * @returns {JSX.Element} Rendered component
 */
export function FormDependencyGraph({ dependencies }: FormDependencyGraphProps) {
  const [graphData, setGraphData] = useState<GraphData>({ nodes: [], links: [] })
  const [selectedNode, setSelectedNode] = useState<string | null>(null)
  const [transform, setTransform] = useState({ x: 0, y: 0, scale: 1 })

  useEffect(() => {
    // Convert dependencies to graph data
    const nodes = dependencies.map(dep => ({
      id: dep.id,
      name: dep.name,
      status: dep.status
    }))

    const links = dependencies.flatMap(dep =>
      dep.dependsOn.map(target => ({
        source: dep.id,
        target: target.id
      }))
    )

    setGraphData({ nodes, links })
  }, [dependencies])

  const handleNodeClick = (nodeId: string) => {
    setSelectedNode(nodeId)
  }

  const handleZoom = (scale: number) => {
    setTransform(prev => ({ ...prev, scale }))
  }

  return (
    <div className="relative w-full h-[600px] border rounded-lg">
      <div className="absolute top-4 right-4 space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleZoom(transform.scale + 0.1)}
          aria-label="Zoom in"
        >
          +
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleZoom(Math.max(0.1, transform.scale - 0.1))}
          aria-label="Zoom out"
        >
          -
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setTransform({ x: 0, y: 0, scale: 1 })}
          aria-label="Reset view"
        >
          Reset
        </Button>
      </div>

      <svg
        width="100%"
        height="100%"
        viewBox="0 0 800 600"
        role="img"
        aria-label="Form dependency graph"
      >
        <g transform={`translate(${transform.x},${transform.y}) scale(${transform.scale})`}>
          {graphData.links.map((link, i) => (
            <line
              key={`link-${i}`}
              x1={link.source.x}
              y1={link.source.y}
              x2={link.target.x}
              y2={link.target.y}
              stroke="#999"
              strokeWidth={1}
              markerEnd="url(#arrowhead)"
            />
          ))}
          {graphData.nodes.map((node) => (
            <g
              key={node.id}
              transform={`translate(${node.x},${node.y})`}
              onClick={() => handleNodeClick(node.id)}
              role="button"
              aria-pressed={selectedNode === node.id}
              tabIndex={0}
            >
              <circle
                r={20}
                fill={selectedNode === node.id ? "#666" : "#999"}
                className="cursor-pointer"
              />
              <text
                dy=".35em"
                textAnchor="middle"
                fill="white"
                fontSize={12}
                className="select-none pointer-events-none"
              >
                {node.name.substring(0, 2)}
              </text>
            </g>
          ))}
        </g>
      </svg>
    </div>
  )
} 