"use client";

/**
 * @file TasksDataTable.tsx
 * @description Enhanced data table component with advanced filtering, bulk updates, and notifications
 */

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  RowSelectionState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { ArrowUpDown, Calendar, Search, User, X, CheckSquare, Flag } from "lucide-react";
import { format, formatDistanceToNow, isWithinInterval, startOfDay, endOfDay, parseISO, subDays } from "date-fns";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
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
import { useToast } from "@/components/ui/use-toast";
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
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Task {
  id: string;
  name: string;
  description: string | null;
  status: string;
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  project: {
    id: string;
    name: string;
  } | null;
  assignedTo: {
    id: string;
    name: string | null;
  } | null;
  department: {
    id: string;
    name: string;
  } | null;
  createdAt: string;
}

interface TasksDataTableProps {
  tasks: Task[];
}

const TASK_STATUSES = [
  "NOT_STARTED",
  "IN_PROGRESS",
  "ON_HOLD",
  "COMPLETED",
] as const;

const TASK_PRIORITIES = [
  { value: "LOW", label: "Low", color: "bg-slate-500" },
  { value: "MEDIUM", label: "Medium", color: "bg-blue-500" },
  { value: "HIGH", label: "High", color: "bg-amber-500" },
  { value: "URGENT", label: "Urgent", color: "bg-red-500" },
] as const;

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
 * Gets the appropriate color for priority level
 */
function getPriorityColor(priority: string) {
  return TASK_PRIORITIES.find((p) => p.value === priority)?.color || "bg-slate-500";
}

interface DateRange {
  from?: Date;
  to?: Date;
}

interface SavedFilter {
  name: string;
  filters: ColumnFiltersState;
}

const DATE_RANGE_PRESETS = [
  { label: "Today", days: 0 },
  { label: "Last 7 days", days: 7 },
  { label: "Last 30 days", days: 30 },
  { label: "Last 90 days", days: 90 },
  { label: "Custom range", days: null },
] as const;

/**
 * Tasks data table component
 */
export function TasksDataTable({ tasks: initialTasks }: TasksDataTableProps) {
  const [tasks, setTasks] = useState(initialTasks);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [dateRange, setDateRange] = useState<DateRange>({});
  const [savedFilters, setSavedFilters] = useState<SavedFilter[]>([]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [showDatePicker, setShowDatePicker] = useState(false);
  const { toast } = useToast();

  // Load saved filters from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("taskFilters");
    if (saved) {
      setSavedFilters(JSON.parse(saved));
    }
  }, []);

  // Save filters to localStorage
  const handleSaveFilter = () => {
    const name = prompt("Enter a name for this filter set:");
    if (name) {
      const newFilter = { name, filters: columnFilters };
      const updated = [...savedFilters, newFilter];
      setSavedFilters(updated);
      localStorage.setItem("taskFilters", JSON.stringify(updated));
    }
  };

  // Apply saved filter
  const handleApplyFilter = (filter: SavedFilter) => {
    setColumnFilters(filter.filters);
  };

  // Delete saved filter
  const handleDeleteFilter = (index: number) => {
    const updated = savedFilters.filter((_, i) => i !== index);
    setSavedFilters(updated);
    localStorage.setItem("taskFilters", JSON.stringify(updated));
  };

  // Extract unique departments and assignees for filters
  const departments = useMemo(() => {
    const deptSet = new Set<string>();
    tasks.forEach((task) => {
      if (task.department?.name) {
        deptSet.add(task.department.name);
      }
    });
    return Array.from(deptSet).sort();
  }, [tasks]);

  const assignees = useMemo(() => {
    const assigneeSet = new Set<string>();
    tasks.forEach((task) => {
      if (task.assignedTo?.name) {
        assigneeSet.add(task.assignedTo.name);
      }
    });
    return Array.from(assigneeSet).sort();
  }, [tasks]);

  // Apply date range preset
  const handleDatePreset = (days: number | null) => {
    if (days === null) {
      setShowDatePicker(true);
      return;
    }

    const to = new Date();
    const from = days === 0 ? startOfDay(to) : subDays(to, days);
    setDateRange({ from, to });
    table.getColumn("createdAt")?.setFilterValue(Date.now());
    setShowDatePicker(false);
  };

  // Update task status
  const handleStatusUpdate = async (taskId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      
      if (!response.ok) throw new Error("Failed to update status");
      
      // Optimistically update the UI
      const updatedTasks = tasks.map(task => 
        task.id === taskId ? { ...task, status: newStatus } : task
      );
      setTasks(updatedTasks);

      toast({
        title: "Status Updated",
        description: `Task status changed to ${newStatus.toLowerCase().replace("_", " ")}`,
      });
    } catch (error) {
      console.error("Error updating task status:", error);
      toast({
        title: "Error",
        description: "Failed to update task status",
        variant: "destructive",
      });
    }
  };

  // Bulk update task statuses
  const handleBulkStatusUpdate = async (newStatus: string) => {
    const selectedTaskIds = Object.keys(rowSelection);
    if (selectedTaskIds.length === 0) {
      toast({
        title: "No Tasks Selected",
        description: "Please select tasks to update",
        variant: "destructive",
      });
      return;
    }

    try {
      const promises = selectedTaskIds.map(taskId =>
        fetch(`/api/tasks/${taskId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: newStatus }),
        })
      );

      await Promise.all(promises);

      // Optimistically update the UI
      const updatedTasks = tasks.map(task =>
        selectedTaskIds.includes(task.id) ? { ...task, status: newStatus } : task
      );
      setTasks(updatedTasks);
      setRowSelection({});

      toast({
        title: "Bulk Update Successful",
        description: `Updated ${selectedTaskIds.length} tasks to ${newStatus.toLowerCase().replace("_", " ")}`,
      });
    } catch (error) {
      console.error("Error in bulk update:", error);
      toast({
        title: "Error",
        description: "Failed to update some tasks",
        variant: "destructive",
      });
    }
  };

  // Add handlePriorityUpdate function
  const handlePriorityUpdate = async (taskId: string, newPriority: string) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priority: newPriority }),
      });
      
      if (!response.ok) throw new Error("Failed to update priority");
      
      // Optimistically update the UI
      const updatedTasks = tasks.map(task => 
        task.id === taskId ? { ...task, priority: newPriority } : task
      );
      setTasks(updatedTasks);

      toast({
        title: "Priority Updated",
        description: `Task priority changed to ${newPriority.toLowerCase()}`,
      });
    } catch (error) {
      console.error("Error updating task priority:", error);
      toast({
        title: "Error",
        description: "Failed to update task priority",
        variant: "destructive",
      });
    }
  };

  // Add bulk priority update function
  const handleBulkPriorityUpdate = async (newPriority: string) => {
    const selectedTaskIds = Object.keys(rowSelection);
    if (selectedTaskIds.length === 0) {
      toast({
        title: "No Tasks Selected",
        description: "Please select tasks to update",
        variant: "destructive",
      });
      return;
    }

    try {
      const promises = selectedTaskIds.map(taskId =>
        fetch(`/api/tasks/${taskId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ priority: newPriority }),
        })
      );

      await Promise.all(promises);

      // Optimistically update the UI
      const updatedTasks = tasks.map(task =>
        selectedTaskIds.includes(task.id) ? { ...task, priority: newPriority } : task
      );
      setTasks(updatedTasks);
      setRowSelection({});

      toast({
        title: "Bulk Update Successful",
        description: `Updated ${selectedTaskIds.length} tasks to ${newPriority.toLowerCase()} priority`,
      });
    } catch (error) {
      console.error("Error in bulk update:", error);
      toast({
        title: "Error",
        description: "Failed to update some tasks",
        variant: "destructive",
      });
    }
  };

  const columns: ColumnDef<Task>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "name",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Task
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const task = row.original;
        return (
          <Link
            href={task.project ? `/projects/${task.project.id}/tasks/${task.id}` : `/tasks/${task.id}`}
            className="hover:underline"
          >
            <div className="font-medium">{task.name}</div>
            {task.description && (
              <div className="text-sm text-muted-foreground">
                {task.description}
              </div>
            )}
          </Link>
        );
      },
      filterFn: "includesString",
    },
    {
      accessorKey: "project",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Project
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const project = row.original.project;
        return project ? (
          <Link href={`/projects/${project.id}`} className="hover:underline">
            {project.name}
          </Link>
        ) : (
          <span className="text-muted-foreground">No Project</span>
        );
      },
    },
    {
      accessorKey: "status",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Status
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const status = row.getValue("status") as string;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-full justify-start p-2">
                <Badge variant={getStatusVariant(status)}>
                  {status.toLowerCase().replace("_", " ")}
                </Badge>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {TASK_STATUSES.map((newStatus) => (
                <DropdownMenuItem
                  key={newStatus}
                  onClick={() => handleStatusUpdate(row.original.id, newStatus)}
                >
                  <Badge variant={getStatusVariant(newStatus)} className="mr-2">
                    {newStatus.toLowerCase().replace("_", " ")}
                  </Badge>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
      filterFn: (row, id, value) => {
        return value === "" || row.getValue(id) === value;
      },
    },
    {
      accessorKey: "assignedTo",
      header: "Assignee",
      cell: ({ row }) => {
        const assignee = row.original.assignedTo;
        return assignee ? (
          <div className="flex items-center gap-2">
            <Avatar className="h-6 w-6">
              <AvatarFallback>
                {assignee.name?.[0]?.toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm">{assignee.name}</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-muted-foreground">
            <User className="h-4 w-4" />
            <span className="text-sm">Unassigned</span>
          </div>
        );
      },
      filterFn: (row, id, value) => {
        if (value === "") return true;
        const assignee = row.original.assignedTo;
        if (value === "unassigned") return !assignee;
        return assignee?.name === value;
      },
    },
    {
      accessorKey: "department",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Department
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => row.original.department?.name || "N/A",
      filterFn: (row, id, value) => {
        if (value === "") return true;
        return row.original.department?.name === value;
      },
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Created
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        return (
          <div className="text-muted-foreground text-sm">
            {formatDistanceToNow(new Date(row.getValue("createdAt")), {
              addSuffix: true,
            })}
          </div>
        );
      },
      filterFn: (row) => {
        if (!dateRange.from && !dateRange.to) return true;
        const createdAt = parseISO(row.original.createdAt);
        if (dateRange.from && dateRange.to) {
          return isWithinInterval(createdAt, {
            start: startOfDay(dateRange.from),
            end: endOfDay(dateRange.to),
          });
        }
        if (dateRange.from) {
          return createdAt >= startOfDay(dateRange.from);
        }
        if (dateRange.to) {
          return createdAt <= endOfDay(dateRange.to);
        }
        return true;
      },
    },
    {
      accessorKey: "priority",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Priority
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const priority = row.getValue("priority") as string;
        const priorityInfo = TASK_PRIORITIES.find((p) => p.value === priority);
        
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-full justify-start p-2">
                <div className="flex items-center gap-2">
                  <div className={`h-2 w-2 rounded-full ${priorityInfo?.color}`} />
                  <span>{priorityInfo?.label}</span>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {TASK_PRIORITIES.map((p) => (
                <DropdownMenuItem
                  key={p.value}
                  onClick={() => handlePriorityUpdate(row.original.id, p.value)}
                >
                  <div className="flex items-center gap-2">
                    <div className={`h-2 w-2 rounded-full ${p.color}`} />
                    {p.label}
                  </div>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
      filterFn: (row, id, value) => {
        return value === "" || row.getValue(id) === value;
      },
    },
  ];

  const table = useReactTable({
    data: tasks,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      rowSelection,
    },
  });

  return (
    <div>
      <div className="flex flex-col gap-4 py-4">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2 flex-wrap">
            <Input
              placeholder="Filter tasks..."
              value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
              onChange={(event) =>
                table.getColumn("name")?.setFilterValue(event.target.value)
              }
              className="max-w-sm"
              prefix={<Search className="h-4 w-4 text-muted-foreground" />}
            />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-[180px]">
                  <Calendar className="mr-2 h-4 w-4" />
                  {dateRange.from
                    ? `${format(dateRange.from, "MMM d")}${
                        dateRange.to ? ` - ${format(dateRange.to, "MMM d")}` : ""
                      }`
                    : "Filter by date"}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-[180px]">
                {DATE_RANGE_PRESETS.map((preset) => (
                  <DropdownMenuItem
                    key={preset.label}
                    onClick={() => handleDatePreset(preset.days)}
                  >
                    {preset.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {showDatePicker && (
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline">Custom Range</Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    initialFocus
                    mode="range"
                    defaultMonth={dateRange.from}
                    selected={{
                      from: dateRange.from,
                      to: dateRange.to,
                    }}
                    onSelect={(range) => {
                      setDateRange(range || {});
                      table.getColumn("createdAt")?.setFilterValue(Date.now());
                    }}
                    numberOfMonths={2}
                  />
                </PopoverContent>
              </Popover>
            )}

            <Select
              value={(table.getColumn("status")?.getFilterValue() as string) ?? "all"}
              onValueChange={(value) => {
                table.getColumn("status")?.setFilterValue(value === "all" ? "" : value);
              }}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {TASK_STATUSES.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status.toLowerCase().replace("_", " ")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={(table.getColumn("department")?.getFilterValue() as string) ?? "all"}
              onValueChange={(value) => {
                table.getColumn("department")?.setFilterValue(value === "all" ? "" : value);
              }}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {departments.map((dept) => (
                  <SelectItem key={dept} value={dept}>
                    {dept}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={(table.getColumn("assignedTo")?.getFilterValue() as string) ?? "all"}
              onValueChange={(value) => {
                table.getColumn("assignedTo")?.setFilterValue(value === "all" ? "" : value);
              }}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by assignee" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Assignees</SelectItem>
                <SelectItem value="unassigned">Unassigned</SelectItem>
                {assignees.map((assignee) => (
                  <SelectItem key={assignee} value={assignee}>
                    {assignee}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={(table.getColumn("priority")?.getFilterValue() as string) ?? "all"}
              onValueChange={(value) => {
                table.getColumn("priority")?.setFilterValue(value === "all" ? "" : value);
              }}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                {TASK_PRIORITIES.map((priority) => (
                  <SelectItem key={priority.value} value={priority.value}>
                    <div className="flex items-center gap-2">
                      <div className={`h-2 w-2 rounded-full ${priority.color}`} />
                      {priority.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {Object.keys(rowSelection).length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                {Object.keys(rowSelection).length} selected
              </span>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">
                    <CheckSquare className="mr-2 h-4 w-4" />
                    Bulk Update
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger>
                      <Flag className="mr-2 h-4 w-4" />
                      Set Priority
                    </DropdownMenuSubTrigger>
                    <DropdownMenuSubContent>
                      {TASK_PRIORITIES.map((priority) => (
                        <DropdownMenuItem
                          key={priority.value}
                          onClick={() => handleBulkPriorityUpdate(priority.value)}
                        >
                          <div className="flex items-center gap-2">
                            <div className={`h-2 w-2 rounded-full ${priority.color}`} />
                            {priority.label}
                          </div>
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuSubContent>
                  </DropdownMenuSub>
                  <DropdownMenuSeparator />
                  {TASK_STATUSES.map((status) => (
                    <DropdownMenuItem
                      key={status}
                      onClick={() => handleBulkStatusUpdate(status)}
                    >
                      <Badge variant={getStatusVariant(status)} className="mr-2">
                        {status.toLowerCase().replace("_", " ")}
                      </Badge>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          {table.getState().columnFilters.map((filter) => (
            <Badge
              key={filter.id}
              variant="secondary"
              className="flex items-center gap-1"
            >
              {filter.id === "name" && "Search"}
              {filter.id === "status" && "Status"}
              {filter.id === "department" && "Department"}
              {filter.id === "assignedTo" && "Assignee"}
              {filter.id === "createdAt" && "Date Range"}
              {filter.id === "priority" && "Priority"}
              : {filter.value as string}
              <Button
                variant="ghost"
                size="icon"
                className="h-4 w-4 p-0 hover:bg-transparent"
                onClick={() => {
                  if (filter.id === "createdAt") {
                    setDateRange({});
                  }
                  table.getColumn(filter.id)?.setFilterValue("");
                }}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}
          {(dateRange.from || dateRange.to) && (
            <Badge
              variant="secondary"
              className="flex items-center gap-1"
            >
              Date Range:{" "}
              {dateRange.from
                ? format(dateRange.from, "MMM d")
                : ""}
              {dateRange.to ? ` - ${format(dateRange.to, "MMM d")}` : ""}
              <Button
                variant="ghost"
                size="icon"
                className="h-4 w-4 p-0 hover:bg-transparent"
                onClick={() => {
                  setDateRange({});
                  table.getColumn("createdAt")?.setFilterValue("");
                }}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No tasks found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between py-4">
        <div className="text-sm text-muted-foreground">
          {table.getFilteredRowModel().rows.length} tasks found
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
} 