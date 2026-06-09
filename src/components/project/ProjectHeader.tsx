"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { ArrowLeft, List, Plus, SquareKanban, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import ConfirmDialog from "@/components/dialog/ConfirmDialog";
import EditProjectDialog from "@/components/dialog/EditProjectDialog";
import AddColumnDialog from "@/components/dialog/AddColumnDialog";
import { deleteProject } from "@/actions/project.action";
import { cn } from "@/lib/utils";
import Link from "next/link";

type Project = {
  id: string;
  name: string;
  color: string;
  description: string | null;
};

function ProjectHeader({
  project,
  workspaceSlug,
  isOwnerOrAdmin,
  isViewer,
  activeView,
}: {
  project: Project;
  workspaceSlug: string;
  isOwnerOrAdmin: boolean;
  activeView: string;
  isViewer: boolean;
}) {
  const router = useRouter();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const viewLinks = [
    { href: "kanban", label: "Kanban", icon: SquareKanban },
    { href: "list", label: "List", icon: List },
  ];

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const response = await deleteProject(project.id);
      if (response.error) return toast.error(response.error);
      toast.success("Project deleted.");
      router.push(`/workspaces/${workspaceSlug}`);
    } catch {
      toast.error("An error occurred.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 md:gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push(`/workspaces/${workspaceSlug}`)}
          >
            <ArrowLeft className="size-4" />
          </Button>
          <div
            className="size-4 rounded-full shrink-0"
            style={{ backgroundColor: project.color }}
          />
          <div>
            <h1 className="text-md md:text-xl font-semibold">{project.name}</h1>
            {project.description && (
              <p className="text-xs text-muted-foreground">
                {project.description}
              </p>
            )}
          </div>
        </div>

        {isOwnerOrAdmin && (
          <div className="flex items-center gap-2">
            <EditProjectDialog project={project} />
            <Button
              variant="outline"
              size="icon"
              onClick={() => setConfirmOpen(true)}
              className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
            >
              <Trash2 className="size-4" />
            </Button>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center w-fit bg-neutral-100 dark:bg-neutral-900 p-1 rounded-lg">
          {viewLinks.map(({ href, label, icon: Icon }) => (
            <Button
              key={href}
              size="sm"
              variant="ghost"
              className={cn(activeView === href && "text-indigo-500")}
              asChild
            >
              <Link href={`?view=${href}`}>
                <Icon className="size-4" />
                <span className="hidden md:block">{label}</span>
              </Link>
            </Button>
          ))}
        </div>
        {activeView === "list" && !isViewer && (
          <AddColumnDialog projectId={project.id} />
        )}
      </div>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Delete Project"
        description={
          <>
            Are you sure you want to delete{" "}
            <span className="font-semibold">{project.name}</span>?<br />
            All tasks and columns will be permanently deleted.
          </>
        }
        onConfirm={handleDelete}
        isLoading={isDeleting}
        confirmLabel="Delete Project"
      />
    </>
  );
}

export default ProjectHeader;
