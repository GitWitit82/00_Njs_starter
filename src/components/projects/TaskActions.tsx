"use client";

/**
 * @file TaskActions.tsx
 * @description Task actions component with status updates and user assignment
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import { TaskStatus } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface TaskActionsProps {
  taskId: string;
  currentStatus: TaskStatus;
  currentAssignee?: {
    id: string;
    name: string | null;
  } | null;
  users: Array<{
    id: string;
    name: string | null;
  }>;
}

export function TaskActions({
  taskId,
  currentStatus,
  currentAssignee,
  users,
}: TaskActionsProps) {
  const router = useRouter();
  const [status, setStatus] = useState<TaskStatus>(currentStatus);
  const [assignee, setAssignee] = useState<string | undefined>(
    currentAssignee?.id
  );
  const [scheduledStart, setScheduledStart] = useState<Date>();
  const [scheduledEnd, setScheduledEnd] = useState<Date>();
  const [actualStart, setActualStart] = useState<Date>();
  const [actualEnd, setActualEnd] = useState<Date>();

  const handleStatusChange = async (newStatus: TaskStatus) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error("Failed to update task status");
      }

      setStatus(newStatus);
      router.refresh();
      toast.success("Task status updated successfully");
    } catch (error) {
      console.error("Error updating task status:", error);
      toast.error("Failed to update task status");
    }
  };

  const handleAssigneeChange = async (userId: string) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ assignedToId: userId }),
      });

      if (!response.ok) {
        throw new Error("Failed to update task assignee");
      }

      setAssignee(userId);
      router.refresh();
      toast.success("Task assignee updated successfully");
    } catch (error) {
      console.error("Error updating task assignee:", error);
      toast.error("Failed to update task assignee");
    }
  };

  const handleScheduleUpdate = async () => {
    if (!scheduledStart || !scheduledEnd) {
      toast.error("Please select both start and end dates");
      return;
    }

    try {
      const response = await fetch(`/api/tasks/${taskId}/schedule`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          scheduledStart,
          scheduledEnd,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update task schedule");
      }

      router.refresh();
      toast.success("Task schedule updated successfully");
    } catch (error) {
      console.error("Error updating task schedule:", error);
      toast.error("Failed to update task schedule");
    }
  };

  const handleActualDatesUpdate = async () => {
    if (!actualStart || !actualEnd) {
      toast.error("Please select both start and end dates");
      return;
    }

    try {
      const response = await fetch(`/api/tasks/${taskId}/schedule`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          actualStart,
          actualEnd,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update actual dates");
      }

      router.refresh();
      toast.success("Actual dates updated successfully");
    } catch (error) {
      console.error("Error updating actual dates:", error);
      toast.error("Failed to update actual dates");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Select value={status} onValueChange={handleStatusChange}>
          <SelectTrigger>
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent>
            {Object.values(TaskStatus).map((status) => (
              <SelectItem key={status} value={status}>
                {status}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={assignee} onValueChange={handleAssigneeChange}>
          <SelectTrigger>
            <SelectValue
              placeholder={
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span>Assign to</span>
                </div>
              }
            />
          </SelectTrigger>
          <SelectContent>
            {users.map((user) => (
              <SelectItem key={user.id} value={user.id}>
                {user.name || "Unnamed User"}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <h4 className="font-medium">Scheduled Dates</h4>
          <div className="flex gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-[240px] justify-start text-left font-normal",
                    !scheduledStart && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {scheduledStart ? (
                    format(scheduledStart, "PPP")
                  ) : (
                    <span>Pick start date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={scheduledStart}
                  onSelect={setScheduledStart}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-[240px] justify-start text-left font-normal",
                    !scheduledEnd && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {scheduledEnd ? (
                    format(scheduledEnd, "PPP")
                  ) : (
                    <span>Pick end date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={scheduledEnd}
                  onSelect={setScheduledEnd}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          <Button onClick={handleScheduleUpdate}>Update Schedule</Button>
        </div>

        <div className="space-y-2">
          <h4 className="font-medium">Actual Dates</h4>
          <div className="flex gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-[240px] justify-start text-left font-normal",
                    !actualStart && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {actualStart ? (
                    format(actualStart, "PPP")
                  ) : (
                    <span>Pick start date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={actualStart}
                  onSelect={setActualStart}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-[240px] justify-start text-left font-normal",
                    !actualEnd && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {actualEnd ? (
                    format(actualEnd, "PPP")
                  ) : (
                    <span>Pick end date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={actualEnd}
                  onSelect={setActualEnd}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          <Button onClick={handleActualDatesUpdate}>Update Actual Dates</Button>
        </div>
      </div>
    </div>
  );
} 