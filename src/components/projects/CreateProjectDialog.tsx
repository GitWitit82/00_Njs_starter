"use client";

/**
 * @file CreateProjectDialog.tsx
 * @description Dialog component for creating new projects
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { useSession } from "next-auth/react";

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
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const { data: session, status } = useSession();

  const handleSubmit = async (data: any) => {
    if (status === "loading") {
      return;
    }

    if (status === "unauthenticated" || !session?.user?.id) {
      toast({
        title: "Authentication Error",
        description: "Please log in to create a project",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch("/api/projects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          ...data,
          managerId: session.user.id,
        }),
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.error || "Failed to create project");
      }

      toast({
        title: "Success",
        description: "Project created successfully",
      });

      setOpen(false);
      router.refresh();
      router.push(`/projects/${responseData.id}`);
    } catch (error) {
      console.error("Error creating project:", error);
      toast({
        title: "Error",
        description: error instanceof Error 
          ? `Failed to create project: ${error.message}` 
          : "Failed to create project. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
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
        <CreateProjectForm 
          workflows={workflows} 
          onSubmit={handleSubmit} 
          isLoading={isLoading}
        />
      </DialogContent>
    </Dialog>
  );
} 