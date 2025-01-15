"use client";

/**
 * @file TaskComments.tsx
 * @description Component for displaying and adding task comments and activity
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MessageSquare, Send } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

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

interface TaskCommentsProps {
  taskId: string;
  projectId: string;
  activity: TaskActivity[];
}

/**
 * Gets the activity icon based on activity type
 */
function getActivityIcon(type: string) {
  switch (type) {
    case "COMMENT":
      return <MessageSquare className="h-4 w-4" />;
    default:
      return null;
  }
}

/**
 * Gets the activity message based on activity type and content
 */
function getActivityMessage(type: string, content: string) {
  switch (type) {
    case "COMMENT":
      return content;
    case "STATUS_CHANGE":
      return `Changed status to ${content.toLowerCase()}`;
    case "ASSIGNMENT":
      return content ? `Assigned to ${content}` : "Removed assignment";
    default:
      return content;
  }
}

/**
 * Task comments and activity component
 */
export function TaskComments({ taskId, projectId, activity }: TaskCommentsProps) {
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  /**
   * Handles comment submission
   */
  const handleSubmit = async () => {
    if (!comment.trim()) return;

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/projects/${projectId}/tasks/${taskId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ comment: comment.trim() }),
      });

      if (!response.ok) {
        throw new Error("Failed to add comment");
      }

      setComment("");
      toast({
        title: "Comment added",
        description: "Your comment has been added to the task.",
      });

      router.refresh();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add comment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-start space-x-4">
        <Textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Add a comment..."
          className="flex-1"
        />
        <Button
          onClick={handleSubmit}
          disabled={!comment.trim() || isSubmitting}
          size="icon"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>

      <ScrollArea className="h-[300px] pr-4">
        <div className="space-y-4">
          {activity.map((item) => (
            <div key={item.id} className="flex items-start space-x-4">
              <Avatar className="h-8 w-8">
                <AvatarFallback>
                  {item.user.name?.[0]?.toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="font-medium">{item.user.name}</span>
                  <span className="text-sm text-muted-foreground">
                    {formatDistanceToNow(new Date(item.createdAt), {
                      addSuffix: true,
                    })}
                  </span>
                </div>
                <div className="flex items-start space-x-2">
                  {getActivityIcon(item.type)}
                  <p className="text-sm">
                    {getActivityMessage(item.type, item.content)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
} 