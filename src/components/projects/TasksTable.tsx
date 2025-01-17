"use client";

/**
 * @file TasksTable.tsx
 * @description Table component for displaying project tasks with status and actions
 */

import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { User } from "lucide-react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { TaskWithRelations } from "@/types/tasks";
import { getStatusVariant } from "@/lib/utils/ui";

interface TasksTableProps {
  projectId: string;
  tasks: TaskWithRelations[];
}

/**
 * Tasks table component
 */
export function TasksTable({ projectId, tasks }: TasksTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Task</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Assignee</TableHead>
          <TableHead>Created</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {tasks.length === 0 ? (
          <TableRow>
            <TableCell colSpan={4} className="text-center">
              No tasks found.
            </TableCell>
          </TableRow>
        ) : (
          tasks.map((task) => (
            <TableRow key={task.id}>
              <TableCell>
                <Link
                  href={`/projects/${projectId}/tasks/${task.id}`}
                  className="hover:underline"
                >
                  <div className="font-medium">{task.name}</div>
                  {task.description && (
                    <div className="text-sm text-muted-foreground">
                      {task.description}
                    </div>
                  )}
                </Link>
              </TableCell>
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
                    <span className="text-sm">{task.assignedTo.name}</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <User className="h-4 w-4" />
                    <span className="text-sm">Unassigned</span>
                  </div>
                )}
              </TableCell>
              <TableCell className="text-muted-foreground text-sm">
                {formatDistanceToNow(new Date(task.createdAt), {
                  addSuffix: true,
                })}
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
} 