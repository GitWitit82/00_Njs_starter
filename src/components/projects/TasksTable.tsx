"use client";

/**
 * @file TasksTable.tsx
 * @description Table component for displaying project tasks with links to task details
 */

import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";

interface User {
  id: string;
  name: string | null;
}

interface Task {
  id: string;
  name: string;
  status: string;
  assignedTo: User | null;
  updatedAt: string;
}

interface TasksTableProps {
  projectId: string;
  tasks: Task[];
}

/**
 * Gets the appropriate badge variant based on task status
 */
function getStatusVariant(status: string) {
  switch (status) {
    case "NOT_STARTED":
      return "secondary";
    case "IN_PROGRESS":
      return "default";
    case "ON_HOLD":
      return "warning";
    case "COMPLETED":
      return "success";
    default:
      return "secondary";
  }
}

/**
 * Tasks table component
 */
export function TasksTable({ projectId, tasks }: TasksTableProps) {
  const router = useRouter();

  /**
   * Handles clicking a task row
   */
  const handleTaskClick = (taskId: string) => {
    router.push(`/projects/${projectId}/tasks/${taskId}`);
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Task</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Assigned To</TableHead>
          <TableHead>Last Updated</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {tasks.map((task) => (
          <TableRow
            key={task.id}
            className="cursor-pointer hover:bg-muted/50"
            onClick={() => handleTaskClick(task.id)}
          >
            <TableCell className="font-medium">{task.name}</TableCell>
            <TableCell>
              <Badge variant={getStatusVariant(task.status)}>
                {task.status.toLowerCase().replace("_", " ")}
              </Badge>
            </TableCell>
            <TableCell>
              {task.assignedTo ? (
                <div className="flex items-center gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarFallback>
                      {task.assignedTo.name?.[0]?.toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <span>{task.assignedTo.name}</span>
                </div>
              ) : (
                <span className="text-muted-foreground">Unassigned</span>
              )}
            </TableCell>
            <TableCell className="text-muted-foreground">
              {formatDistanceToNow(new Date(task.updatedAt), { addSuffix: true })}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
} 