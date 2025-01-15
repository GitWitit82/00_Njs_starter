"use client";

/**
 * @file CreateProjectDialog.tsx
 * @description Dialog component for creating new projects
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { CreateProjectForm } from "./CreateProjectForm";

interface Workflow {
  id: string;
  name: string;
}

interface CreateProjectDialogProps {
  workflows: Workflow[];
}

/**
 * Dialog component for creating new projects
 */
export function CreateProjectDialog({ workflows }: CreateProjectDialogProps) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleSubmit = async (data: any) => {
    try {
      const response = await fetch("/api/projects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error);
      }

      const project = await response.json();

      toast({
        title: "Success",
        description: "Project created successfully",
      });

      setOpen(false);
      router.refresh();
      router.push(`/projects/${project.id}`);
    } catch (error) {
      console.error("Error creating project:", error);
      toast({
        title: "Error",
        description: "Failed to create project. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          New Project
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create New Project</DialogTitle>
          <DialogDescription>
            Create a new project by selecting a project type and workflow template.
          </DialogDescription>
        </DialogHeader>
        <CreateProjectForm workflows={workflows} onSubmit={handleSubmit} />
      </DialogContent>
    </Dialog>
  );
} 