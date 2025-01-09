"use client"

import { useState, useEffect, useCallback } from "react"

interface SplitViewLayoutProps {
  builder: React.ReactNode
  preview: React.ReactNode
}

export function SplitViewLayout({ builder, preview }: SplitViewLayoutProps) {
  const [isResizing, setIsResizing] = useState(false)
  const [splitPosition, setSplitPosition] = useState(50) // percentage

  const startResizing = useCallback((e: React.MouseEvent) => {
    setIsResizing(true)
    e.preventDefault()
  }, [])

  const stopResizing = useCallback(() => {
    setIsResizing(false)
  }, [])

  const resize = useCallback((e: MouseEvent) => {
    if (isResizing) {
      const container = document.getElementById('split-container')
      if (container) {
        const containerRect = container.getBoundingClientRect()
        const newPosition = ((e.clientX - containerRect.left) / containerRect.width) * 100
        // Limit the resize between 30% and 70%
        setSplitPosition(Math.min(Math.max(newPosition, 30), 70))
      }
    }
  }, [isResizing])

  useEffect(() => {
    if (isResizing) {
      window.addEventListener('mousemove', resize)
      window.addEventListener('mouseup', stopResizing)
      // Add a class to prevent text selection while resizing
      document.body.classList.add('resize-cursor')
    }

    return () => {
      window.removeEventListener('mousemove', resize)
      window.removeEventListener('mouseup', stopResizing)
      document.body.classList.remove('resize-cursor')
    }
  }, [isResizing, resize, stopResizing])

  return (
    <div 
      id="split-container"
      className="relative flex h-[calc(100vh-4rem)]"
      style={{ cursor: isResizing ? 'col-resize' : 'auto' }}
    >
      {/* Builder Panel */}
      <div 
        className="overflow-auto pr-6"
        style={{ width: `${splitPosition}%` }}
      >
        {builder}
      </div>

      {/* Resize Handle */}
      <div
        className="absolute top-0 bottom-0 w-2 cursor-col-resize select-none touch-none"
        style={{ 
          left: `calc(${splitPosition}% - 4px)`,
        }}
        onMouseDown={startResizing}
      >
        <div className="absolute left-1/2 top-0 bottom-0 w-1 -translate-x-1/2 bg-gray-200 group-hover:bg-gray-300 transition-colors" />
      </div>

      {/* Preview Panel */}
      <div 
        className="overflow-auto pl-6"
        style={{ width: `${100 - splitPosition}%` }}
      >
        <div className="sticky top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-10 py-4">
          <h2 className="text-lg font-semibold">Form Preview</h2>
        </div>
        {preview}
      </div>
    </div>
  )
} 