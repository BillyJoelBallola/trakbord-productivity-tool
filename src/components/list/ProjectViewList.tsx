import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Calendar, MessageSquare, Plus } from "lucide-react";
import { format } from "date-fns";

type Tag = { tag: { id: string; name: string; color: string } };
type Task = {
  id: string;
  title: string;
  description: string | null;
  priority: string;
  dueDate: Date | null;
  order: number;
  columnId: string;
  projectId: string;
  assignee: { id: string; username: string; avatar: string | null } | null;
  tags: Tag[];
  _count: { comments: number };
};
type Column = { id: string; name: string; order: number; tasks: Task[] };
type Member = { id: string; username: string; avatar: string | null };

const priorityConfig: Record<string, { dot: string; label: string }> = {
  LOW: {
    dot: "bg-neutral-300 dark:bg-neutral-600",
    label: "text-neutral-400 dark:text-neutral-500",
  },
  MEDIUM: { dot: "bg-blue-400", label: "text-blue-500 dark:text-blue-400" },
  HIGH: { dot: "bg-orange-400", label: "text-orange-500 dark:text-orange-400" },
  URGENT: { dot: "bg-red-500", label: "text-red-500 dark:text-red-400" },
};

function ProjectViewList({
  project,
  members,
  isViewer,
}: {
  project: { id: string; columns: Column[] };
  members: Member[];
  isViewer: boolean;
}) {
  return (
    <Accordion
      className="space-y-4"
      type="multiple"
      defaultValue={["notifications"]}
    >
      {project.columns.map((item) => (
        <AccordionItem key={item.id} value={item.id}>
          <div className="bg-neutral-100 dark:bg-neutral-900 rounded-lg grid grid-cols-[35px_1fr] items-center gap-2 p-2">
            <Button variant="outline" size="sm">
              <Plus className="size-4" />
            </Button>
            <AccordionTrigger className="p-0 flex items-center">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold">{item.name}</span>
                <span className="text-xs text-muted-foreground bg-neutral-200 dark:bg-neutral-700 px-1.5 py-0.5 rounded-full">
                  {item.tasks.length}
                </span>
              </div>
            </AccordionTrigger>
          </div>
          <AccordionContent className="h-fit">
            {item.tasks.map((task) => {
              const p = priorityConfig[task.priority] ?? priorityConfig.MEDIUM;
              const isOverdue =
                task.dueDate && new Date(task.dueDate) < new Date();

              return (
                <div
                  key={task.id}
                  className="flex items-center justify-between border-b p-3"
                >
                  <h1>{task.title}</h1>

                  <div className="flex items-center gap-4">
                    {/* Due date */}
                    {task.dueDate && (
                      <span
                        className={`flex items-center gap-1 text-xs ${
                          isOverdue
                            ? "text-red-500"
                            : "text-neutral-400 dark:text-neutral-500"
                        }`}
                      >
                        <Calendar className="size-3" />
                        {format(new Date(task.dueDate), "MMM d")}
                      </span>
                    )}

                    {/* Priority label */}
                    <div className="flex items-center gap-1">
                      <div className={`size-2 rounded-full ${p.dot}`} />
                      <span className={`text-xs font-medium ${p.label}`}>
                        {task.priority}
                      </span>
                    </div>

                    {/* Comments */}
                    {task._count.comments > 0 && (
                      <span className="flex items-center gap-1 text-xs text-neutral-400 dark:text-neutral-500">
                        <MessageSquare className="size-3" />
                        {task._count.comments}
                      </span>
                    )}

                    {/* Assignee */}
                    {task.assignee && (
                      <Avatar className="size-5">
                        <AvatarFallback className="text-[10px] font-medium bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
                          {task.assignee.username.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                </div>
              );
            })}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}

export default ProjectViewList;
