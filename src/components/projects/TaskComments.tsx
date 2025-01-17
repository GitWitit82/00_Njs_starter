"use client";

/**
 * @file TaskComments.tsx
 * @description Component for displaying and adding task comments and activity
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ActivityType } from "@/lib/services/task-scheduling.service";
import { format } from "date-fns";
import { toast } from "sonner";

interface TaskCommentsProps {
  taskId: string;
  activities: Array<{
    id: string;
    type: string;
    content: string;
    details: string;
    createdAt: Date;
    user: {
      id: string;
      name: string | null;
    };
  }>;
}

export function TaskComments({ taskId, activities }: TaskCommentsProps) {
  const router = useRouter();
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/tasks/${taskId}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: comment,
          type: ActivityType.STATUS_CHANGE,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to add comment");
      }

      setComment("");
      router.refresh();
      toast.success("Comment added successfully");
    } catch (error) {
      console.error("Error adding comment:", error);
      toast.error("Failed to add comment");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="space-y-2">
        <Textarea
          placeholder="Add a comment..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          className="min-h-[100px]"
        />
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Adding..." : "Add Comment"}
        </Button>
      </form>

      <div className="space-y-4">
        {activities.map((activity) => (
          <div key={activity.id} className="space-y-1">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>{activity.user.name || "Unknown User"}</span>
              <span>•</span>
              <span>{format(new Date(activity.createdAt), "MMM d, yyyy")}</span>
            </div>
            <p className="text-sm">{activity.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
} 