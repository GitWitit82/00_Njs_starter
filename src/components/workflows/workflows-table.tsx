'use client';

/**
 * @file components/workflows/workflows-table.tsx
 * @description Table component for displaying workflows
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
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
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { toast } from "sonner"
import { WorkflowModal } from './workflow-modal';

interface WorkflowsTableProps {
  initialData: Workflow[];
  onDelete: (id: string) => Promise<void>;
}

/**
 * WorkflowsTable component
 */
export function WorkflowsTable({ initialData, onDelete }: WorkflowsTableProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow | null>(null);
  const [showModal, setShowModal] = useState(false);

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

  const handleView = (workflowId: string) => {
    router.push(`/workflows/${workflowId}/phases`);
  };

  const handleEdit = (workflow: Workflow) => {
    setSelectedWorkflow(workflow);
    setShowModal(true);
  };

  const handleDuplicate = async (workflow: Workflow) => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/workflows/${workflow.id}/duplicate`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to duplicate workflow');
      }

      router.refresh();
      toast.success("Workflow duplicated successfully");
    } catch (error) {
      toast.error("Failed to duplicate workflow");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuccess = () => {
    setShowModal(false);
    router.refresh();
    toast.success(selectedWorkflow ? "Workflow updated successfully" : "Workflow created successfully");
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
                    <DropdownMenuItem onClick={() => handleView(workflow.id)}>
                      View
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleEdit(workflow)}>
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => handleDuplicate(workflow)}
                      disabled={isLoading}
                    >
                      Duplicate
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => handleDelete(workflow.id)}
                      disabled={isLoading}
                      className="text-destructive"
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

      <WorkflowModal
        workflow={selectedWorkflow}
        open={showModal}
        onOpenChange={setShowModal}
        onSuccess={handleSuccess}
      />
    </div>
  );
} 