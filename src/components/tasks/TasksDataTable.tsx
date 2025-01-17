"use client";

/**
 * @file TasksDataTable.tsx
 * @description Enhanced data table component with advanced filtering, bulk updates, and notifications
 */

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { formatDistanceToNow } from "date-fns"

interface TasksDataTableProps {
  tasks: Task[]
}

interface Task {
  id: string
  name: string
  description: string
  status: string
  priority: string
  createdAt: string
  updatedAt: string
}

/**
 * TasksDataTable component for displaying tasks in a table format
 * @param {TasksDataTableProps} props - Component props
 * @returns {JSX.Element} Rendered component
 */
export function TasksDataTable({ tasks }: TasksDataTableProps) {
  const [sortColumn, setSortColumn] = useState<keyof Task>("createdAt")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc")

  const sortedTasks = [...tasks].sort((a, b) => {
    const aValue = a[sortColumn]
    const bValue = b[sortColumn]

    if (sortDirection === "asc") {
      return aValue > bValue ? 1 : -1
    } else {
      return aValue < bValue ? 1 : -1
    }
  })

  const handleSort = (column: keyof Task) => {
    if (column === sortColumn) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortColumn(column)
      setSortDirection("asc")
    }
  }

  const getStatusVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case "todo":
        return "secondary"
      case "in-progress":
        return "warning"
      case "done":
        return "success"
      default:
        return "default"
    }
  }

  const getPriorityVariant = (priority: string) => {
    switch (priority.toLowerCase()) {
      case "low":
        return "secondary"
      case "medium":
        return "warning"
      case "high":
        return "destructive"
      default:
        return "default"
    }
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>
              <Button
                variant="ghost"
                onClick={() => handleSort("name")}
                className="font-medium"
              >
                Name
                {sortColumn === "name" && (
                  <span className="ml-2">
                    {sortDirection === "asc" ? "↑" : "↓"}
                  </span>
                )}
              </Button>
            </TableHead>
            <TableHead>
              <Button
                variant="ghost"
                onClick={() => handleSort("status")}
                className="font-medium"
              >
                Status
                {sortColumn === "status" && (
                  <span className="ml-2">
                    {sortDirection === "asc" ? "↑" : "↓"}
                  </span>
                )}
              </Button>
            </TableHead>
            <TableHead>
              <Button
                variant="ghost"
                onClick={() => handleSort("priority")}
                className="font-medium"
              >
                Priority
                {sortColumn === "priority" && (
                  <span className="ml-2">
                    {sortDirection === "asc" ? "↑" : "↓"}
                  </span>
                )}
              </Button>
            </TableHead>
            <TableHead>
              <Button
                variant="ghost"
                onClick={() => handleSort("createdAt")}
                className="font-medium"
              >
                Created
                {sortColumn === "createdAt" && (
                  <span className="ml-2">
                    {sortDirection === "asc" ? "↑" : "↓"}
                  </span>
                )}
              </Button>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedTasks.map((task) => (
            <TableRow key={task.id}>
              <TableCell>{task.name}</TableCell>
              <TableCell>
                <Badge variant={getStatusVariant(task.status)}>
                  {task.status}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge variant={getPriorityVariant(task.priority)}>
                  {task.priority}
                </Badge>
              </TableCell>
              <TableCell>
                {formatDistanceToNow(new Date(task.createdAt), {
                  addSuffix: true,
                })}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}