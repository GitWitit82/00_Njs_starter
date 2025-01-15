import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Task Management",
  description: "Manage project tasks, assignments, and activity",
};

/**
 * Layout component for task pages
 */
export default function TaskLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      {children}
    </div>
  );
} 