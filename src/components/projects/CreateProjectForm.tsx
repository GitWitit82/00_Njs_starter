"use client";

/**
 * @file CreateProjectForm.tsx
 * @description Form component for creating new projects with project type selection
 */

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CalendarIcon, Loader2 } from "lucide-react";
import { format } from "date-fns";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const PROJECT_TYPES = {
  VEHICLE_WRAP: "VEHICLE_WRAP",
  SIGN: "SIGN",
  MURAL: "MURAL",
} as const;

type ProjectType = typeof PROJECT_TYPES[keyof typeof PROJECT_TYPES];

/**
 * Schema for project creation form
 */
const createProjectSchema = z.object({
  name: z.string().min(1, "Project name is required"),
  description: z.string().optional(),
  projectType: z.enum([PROJECT_TYPES.VEHICLE_WRAP, PROJECT_TYPES.SIGN, PROJECT_TYPES.MURAL]),
  customerName: z.string().min(1, "Customer name is required"),
  vinNumber: z.string().optional(),
  workflowId: z.string().min(1, "Workflow is required"),
  startDate: z.date({
    required_error: "Start date is required",
  }),
  endDate: z.date().optional(),
});

type FormData = z.infer<typeof createProjectSchema>;

interface Workflow {
  id: string;
  name: string;
}

interface CreateProjectFormProps {
  workflows: Workflow[];
  onSubmit: (data: FormData) => Promise<void>;
  isLoading: boolean;
}

/**
 * Form component for creating new projects
 */
export function CreateProjectForm({ workflows, onSubmit, isLoading }: CreateProjectFormProps) {
  const form = useForm<FormData>({
    resolver: zodResolver(createProjectSchema),
    defaultValues: {
      name: "",
      description: "",
      projectType: PROJECT_TYPES.VEHICLE_WRAP,
      customerName: "",
      vinNumber: "",
      startDate: new Date(),
      workflowId: workflows.find(w => w.name.toLowerCase().includes("vehicle"))?.id || "",
    },
  });

  const projectType = form.watch("projectType");

  // Update workflow when project type changes
  useEffect(() => {
    const defaultWorkflow = workflows.find(w => {
      if (projectType === PROJECT_TYPES.VEHICLE_WRAP) return w.name.toLowerCase().includes("vehicle");
      if (projectType === PROJECT_TYPES.SIGN) return w.name.toLowerCase().includes("sign");
      if (projectType === PROJECT_TYPES.MURAL) return w.name.toLowerCase().includes("mural");
      return false;
    });

    if (defaultWorkflow) {
      form.setValue("workflowId", defaultWorkflow.id);
    }
  }, [projectType, workflows, form]);

  const handleSubmit = async (data: FormData) => {
    try {
      await onSubmit(data);
      form.reset({
        ...form.getValues(),
        name: "",
        description: "",
        customerName: "",
        vinNumber: "",
        startDate: new Date(),
        endDate: undefined,
      });
    } catch (error) {
      console.error("Error creating project:", error);
    }
  };

  const filteredWorkflows = workflows.filter(w => {
    if (projectType === PROJECT_TYPES.VEHICLE_WRAP) return w.name.toLowerCase().includes("vehicle");
    if (projectType === PROJECT_TYPES.SIGN) return w.name.toLowerCase().includes("sign");
    if (projectType === PROJECT_TYPES.MURAL) return w.name.toLowerCase().includes("mural");
    return false;
  });

  // Ensure there's always a selected workflow
  useEffect(() => {
    const currentWorkflowId = form.getValues("workflowId");
    if (!currentWorkflowId && filteredWorkflows.length > 0) {
      form.setValue("workflowId", filteredWorkflows[0].id);
    }
  }, [filteredWorkflows, form]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="projectType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Project Type</FormLabel>
              <Select
                onValueChange={(value) => {
                  field.onChange(value);
                  // Reset workflow when project type changes
                  const matchingWorkflow = workflows.find(w => {
                    if (value === PROJECT_TYPES.VEHICLE_WRAP) return w.name.toLowerCase().includes("vehicle");
                    if (value === PROJECT_TYPES.SIGN) return w.name.toLowerCase().includes("sign");
                    if (value === PROJECT_TYPES.MURAL) return w.name.toLowerCase().includes("mural");
                    return false;
                  });
                  if (matchingWorkflow) {
                    form.setValue("workflowId", matchingWorkflow.id);
                  }
                }}
                value={field.value}
                disabled={isLoading}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select project type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value={PROJECT_TYPES.VEHICLE_WRAP}>Vehicle Wrap</SelectItem>
                  <SelectItem value={PROJECT_TYPES.SIGN}>Sign</SelectItem>
                  <SelectItem value={PROJECT_TYPES.MURAL}>Mural</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Project Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter project name" {...field} disabled={isLoading} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="customerName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Customer Name</FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter customer name"
                  {...field}
                  disabled={isLoading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {projectType === PROJECT_TYPES.VEHICLE_WRAP && (
          <FormField
            control={form.control}
            name="vinNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>VIN Number</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter vehicle VIN number"
                    {...field}
                    disabled={isLoading}
                  />
                </FormControl>
                <FormDescription>
                  Required for vehicle wrap projects
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Enter project description"
                  {...field}
                  disabled={isLoading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="workflowId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Workflow</FormLabel>
              <Select
                onValueChange={field.onChange}
                value={field.value || filteredWorkflows[0]?.id || ""}
                disabled={isLoading}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select workflow" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {filteredWorkflows.map((workflow) => (
                    <SelectItem key={workflow.id} value={workflow.id}>
                      {workflow.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="startDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Start Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                        disabled={isLoading}
                      >
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) =>
                        date < new Date(new Date().setHours(0, 0, 0, 0))
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="endDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>End Date (Optional)</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                        disabled={isLoading}
                      >
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) =>
                        date < (form.getValues("startDate") || new Date())
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button type="submit" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Create Project
        </Button>
      </form>
    </Form>
  );
} 