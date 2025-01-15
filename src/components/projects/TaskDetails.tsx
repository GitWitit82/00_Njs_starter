"use client";

/**
 * @file TaskDetails.tsx
 * @description Component for displaying task details, actions, and comments
 */

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TaskActions } from "./TaskActions";
import { TaskComments } from "./TaskComments";

interface User {
  id: string;
  name: string | null;
}

interface TaskActivity {
  id: string;
  type: string;
  content: string;
  createdAt: string;
  user: User;
}

interface TaskDetailsProps {
  taskId: string;
  projectId: string;
  name: string;
  description: string | null;
  status: string;
  currentAssignee: User | null;
  users: User[];
  activity: TaskActivity[];
}

/**
 * Task details component
 */
export function TaskDetails({
  taskId,
  projectId,
  name,
  description,
  status,
  currentAssignee,
  users,
  activity,
}: TaskDetailsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{name}</CardTitle>
        <TaskActions
          taskId={taskId}
          projectId={projectId}
          currentStatus={status}
          currentAssignee={currentAssignee}
          users={users}
        />
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="details" className="space-y-4">
          <TabsList>
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
          </TabsList>
          <TabsContent value="details" className="space-y-4">
            <div>
              <h3 className="font-medium mb-2">Description</h3>
              <p className="text-sm text-muted-foreground">
                {description || "No description provided."}
              </p>
            </div>
          </TabsContent>
          <TabsContent value="activity">
            <TaskComments
              taskId={taskId}
              projectId={projectId}
              activity={activity}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
} 