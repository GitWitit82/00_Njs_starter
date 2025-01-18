"use client"

/**
 * @file DepartmentsTable Component
 * @description Displays and manages departments
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Department } from "@prisma/client";
import { Plus, MoreHorizontal } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DepartmentModal } from "./department-modal";

interface DepartmentsTableProps {
  departments: Department[];
}

/**
 * DepartmentsTable component for displaying and managing departments
 * @param {DepartmentsTableProps} props - Component props
 * @returns {JSX.Element} Rendered component
 */
export function DepartmentsTable({ departments }: DepartmentsTableProps) {
  const router = useRouter();
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  /**
   * Handles creating a new department
   */
  const handleCreateDepartment = async (_: string | undefined, data: Partial<Department>) => {
    try {
      setIsSubmitting(true);
      const response = await fetch("/api/departments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "same-origin",
        body: JSON.stringify({
          name: data.name,
          description: data.description || "",
          color: data.color,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create department");
      }

      router.refresh();
      setModalOpen(false);
      toast.success("Department created successfully");
    } catch (error) {
      console.error("Create department error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to create department");
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Handles updating a department
   */
  const handleUpdateDepartment = async (departmentId: string, data: Partial<Department>) => {
    try {
      setIsSubmitting(true);
      const response = await fetch(`/api/departments/${departmentId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "CSRF-Token": "required",
        },
        credentials: "include",
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update department");
      }

      router.refresh();
      setModalOpen(false);
      toast.success("Department updated successfully");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update department");
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Handles deleting a department
   */
  const handleDeleteDepartment = async (departmentId: string) => {
    try {
      setIsSubmitting(true);
      const response = await fetch(`/api/departments/${departmentId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete department");
      }

      router.refresh();
      setModalOpen(false);
      toast.success("Department deleted successfully");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete department");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Departments</h2>
        <Button
          onClick={() => {
            setSelectedDepartment(null);
            setModalOpen(true);
          }}
        >
          <Plus className="mr-2 h-4 w-4" />
          New Department
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Color</TableHead>
              <TableHead className="w-[100px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {departments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">
                  No departments found. Click the button above to create one.
                </TableCell>
              </TableRow>
            ) : (
              departments.map((department) => (
                <TableRow key={department.id}>
                  <TableCell className="font-medium">{department.name}</TableCell>
                  <TableCell>{department.description || "—"}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-4 h-4 rounded-full border"
                        style={{ backgroundColor: department.color }}
                      />
                      <span className="font-mono text-sm">{department.color}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Open menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => {
                            setSelectedDepartment(department);
                            setModalOpen(true);
                          }}
                        >
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDeleteDepartment(department.id)}
                          className="text-destructive"
                        >
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <DepartmentModal
        department={selectedDepartment}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={selectedDepartment ? handleUpdateDepartment : handleCreateDepartment}
        onDelete={selectedDepartment ? handleDeleteDepartment : undefined}
        isLoading={isSubmitting}
      />
    </div>
  );
} 