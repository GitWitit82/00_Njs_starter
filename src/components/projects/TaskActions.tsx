"use client";

/**
 * @file TaskActions.tsx
 * @description Task actions component with status updates and user assignment
 */

import { useState } from "react";
import { Check, ChevronsUpDown, User } from "lucide-react";
import { useRouter } from "next/navigation";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";

interface User {
  id: string;
  name: string | null;
}

interface TaskActionsProps {
  taskId: string;
  projectId: string;
  currentStatus: string;
  currentAssignee: User | null;
  users: User[];
}

const TASK_STATUSES = [
  { value: "NOT_STARTED", label: "Not Started" },
  { value: "IN_PROGRESS", label: "In Progress" },
  { value: "ON_HOLD", label: "On Hold" },
  { value: "COMPLETED", label: "Completed" },
];

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
 * Task actions component
 */
export function TaskActions({
  taskId,
  projectId,
  currentStatus,
  currentAssignee,
  users,
}: TaskActionsProps) {
  const [status, setStatus] = useState(currentStatus);
  const [assignee, setAssignee] = useState(currentAssignee);
  const [statusOpen, setStatusOpen] = useState(false);
  const [assignOpen, setAssignOpen] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  /**
   * Updates task status with optimistic update
   */
  const updateStatus = async (newStatus: string) => {
    // Optimistic update
    setStatus(newStatus);
    setStatusOpen(false);

    try {
      const response = await fetch(`/api/projects/${projectId}/tasks/${taskId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error("Failed to update status");
      }

      toast({
        title: "Status updated",
        description: `Task status changed to ${newStatus.toLowerCase().replace("_", " ")}`,
      });

      router.refresh();
    } catch (error) {
      // Revert on error
      setStatus(currentStatus);
      toast({
        title: "Error",
        description: "Failed to update status. Please try again.",
        variant: "destructive",
      });
    }
  };

  /**
   * Assigns user to task with optimistic update
   */
  const assignUser = async (user: User | null) => {
    // Optimistic update
    setAssignee(user);
    setAssignOpen(false);

    try {
      const response = await fetch(`/api/projects/${projectId}/tasks/${taskId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ assignedToId: user?.id || null }),
      });

      if (!response.ok) {
        throw new Error("Failed to assign user");
      }

      toast({
        title: "User assigned",
        description: user
          ? `Task assigned to ${user.name}`
          : "User assignment removed",
      });

      router.refresh();
    } catch (error) {
      // Revert on error
      setAssignee(currentAssignee);
      toast({
        title: "Error",
        description: "Failed to assign user. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Popover open={statusOpen} onOpenChange={setStatusOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={statusOpen}
            className="w-[140px] justify-between"
          >
            <Badge variant={getStatusVariant(status)}>
              {status.toLowerCase().replace("_", " ")}
            </Badge>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[140px] p-0">
          <Command>
            <CommandGroup>
              {TASK_STATUSES.map((statusOption) => (
                <CommandItem
                  key={statusOption.value}
                  value={statusOption.value}
                  onSelect={() => updateStatus(statusOption.value)}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      status === statusOption.value
                        ? "opacity-100"
                        : "opacity-0"
                    )}
                  />
                  <Badge variant={getStatusVariant(statusOption.value)}>
                    {statusOption.label}
                  </Badge>
                </CommandItem>
              ))}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>

      <Popover open={assignOpen} onOpenChange={setAssignOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={assignOpen}
            className="w-[200px] justify-between"
          >
            {assignee ? (
              assignee.name
            ) : (
              <span className="text-muted-foreground">Assign user</span>
            )}
            <User className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[200px] p-0">
          <Command>
            <CommandInput placeholder="Search users..." />
            <CommandEmpty>No users found.</CommandEmpty>
            <CommandGroup>
              <CommandItem onSelect={() => assignUser(null)}>
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    !assignee ? "opacity-100" : "opacity-0"
                  )}
                />
                <span className="text-muted-foreground">Unassigned</span>
              </CommandItem>
              {users.map((user) => (
                <CommandItem
                  key={user.id}
                  value={user.name || ""}
                  onSelect={() => assignUser(user)}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      assignee?.id === user.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {user.name}
                </CommandItem>
              ))}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
} 