'use client';

/**
 * @file components/workflows/workflows-table.tsx
 * @description Table component for displaying workflows
 */

import { useState } from 'react';
import { Workflow } from '@prisma/client';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MoreHorizontal } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from "sonner"

interface WorkflowsTableProps {
  initialData: Workflow[];
  onDelete: (id: string) => Promise<void>;
}

/**
 * WorkflowsTable component
 */
export function WorkflowsTable({ initialData, onDelete }: WorkflowsTableProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleDelete = async (workflowId: string) => {
    try {
      setIsLoading(true);
      await onDelete(workflowId);
      toast.success("Workflow deleted successfully");
    } catch {
      toast.error("Failed to delete workflow");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Phases</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="w-[100px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {initialData.map((workflow) => (
            <TableRow key={workflow.id}>
              <TableCell className="font-medium">{workflow.name}</TableCell>
              <TableCell>{workflow.description}</TableCell>
              <TableCell>
                <Badge variant={workflow.status === 'ACTIVE' ? 'default' : 'secondary'}>
                  {workflow.status}
                </Badge>
              </TableCell>
              <TableCell>{workflow.phases?.length || 0}</TableCell>
              <TableCell>
                {new Date(workflow.createdAt).toLocaleDateString()}
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="h-8 w-8 p-0"
                      disabled={isLoading}
                    >
                      <span className="sr-only">Open menu</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => handleDelete(workflow.id)}
                      disabled={isLoading}
                    >
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
} 