"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft, Trash2 } from "lucide-react";
import { deleteProject } from "@/actions/project.action";
import { Button } from "@/components/ui/button";
import ConfirmDialog from "@/components/dialog/ConfirmDialog";
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
}: {
  project: Project;
  workspaceSlug: string;
  isOwnerOrAdmin: boolean;
}) {
  const router = useRouter();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

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
        <div className="flex items-center gap-3">
          <Link href={`/workspaces/${workspaceSlug}`}>
            <Button variant="ghost" size="icon">
              <ArrowLeft className="size-4" />
            </Button>
          </Link>
          <div
            className="size-4 rounded-full shrink-0"
            style={{ backgroundColor: project.color }}
          />
          <div>
            <h1 className="text-xl font-semibold">{project.name}</h1>
            {project.description && (
              <p className="text-xs text-muted-foreground">
                {project.description}
              </p>
            )}
          </div>
        </div>

        {isOwnerOrAdmin && (
          <Button
            variant="outline"
            size="icon"
            onClick={() => setConfirmOpen(true)}
            className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
          >
            <Trash2 className="size-4" />
          </Button>
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
