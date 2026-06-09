"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { MessageSquare } from "lucide-react";
import { TaskRow } from "@/components/list/TaskRow";
import { AddTaskRow } from "@/components/list/AddTaskRow";

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

const columnAccentColors = [
  "bg-neutral-400",
  "bg-blue-400",
  "bg-yellow-400",
  "bg-green-500",
  "bg-purple-400",
  "bg-pink-400",
];

// Column header
function ColumnHeader({ column, index }: { column: Column; index: number }) {
  return (
    <div className="flex items-center gap-2 px-3 py-2.5 bg-neutral-100 dark:bg-neutral-900">
      <div
        className={`w-0.5 h-4 rounded-none shrink-0 ${
          columnAccentColors[index % columnAccentColors.length]
        }`}
      />
      <AccordionTrigger className="z-20 p-0 [&>svg]:ml-auto">
        <div className="flex items-center gap-2">
          <span className="font-medium text-neutral-700 dark:text-neutral-300">
            {column.name}
          </span>
          <span className="text-[11px] text-muted-foreground border border-neutral-200 dark:border-neutral-700 px-1.5 py-px rounded-full">
            {column.tasks.length}
          </span>
        </div>
      </AccordionTrigger>
    </div>
  );
}

// Table header row
function TableHeader() {
  return (
    <div className="grid grid-cols-[1fr_80px_100px] md:grid-cols-[1fr_80px_100px_80px_60px] gap-0 px-3 py-1.5 border-b border-neutral-100 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/50">
      <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide pl-4">
        Task
      </span>
      <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide text-center">
        Assignee
      </span>
      <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide text-center">
        Due date
      </span>
      <span className="hidden md:block text-[11px] font-medium text-muted-foreground uppercase tracking-wide text-center">
        Priority
      </span>
      <span className="hidden md:block text-[11px] font-medium text-muted-foreground uppercase tracking-wide text-center">
        <MessageSquare className="size-3 mx-auto" />
      </span>
    </div>
  );
}

// Main component
function ProjectViewList({
  project,
  members,
  isViewer,
}: {
  project: { id: string; columns: Column[] };
  members: Member[];
  isViewer: boolean;
}) {
  const doneColumnName = "done";

  return (
    <div className="border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden">
      <Accordion
        type="multiple"
        defaultValue={project.columns.map((c) => c.id)}
      >
        {project.columns.map((column, index) => {
          const isDone = column.name.toLowerCase() === doneColumnName;

          return (
            <AccordionItem
              key={column.id}
              value={column.id}
              className="border-b border-neutral-200 dark:border-neutral-800 last:border-0"
            >
              <ColumnHeader column={column} index={index} />

              <AccordionContent className="p-0">
                <TableHeader />

                {column.tasks.length === 0 ? (
                  <p className="text-xs text-muted-foreground px-5 py-3">
                    No tasks in this column.
                  </p>
                ) : (
                  column.tasks.map((task) => (
                    <TaskRow
                      key={task.id}
                      task={task}
                      isViewer={isViewer}
                      members={members}
                      isDone={isDone}
                    />
                  ))
                )}

                {!isViewer && (
                  <AddTaskRow columnId={column.id} projectId={project.id} />
                )}
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>
    </div>
  );
}

export default ProjectViewList;
