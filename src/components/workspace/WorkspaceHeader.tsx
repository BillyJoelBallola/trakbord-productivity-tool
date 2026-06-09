"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Briefcase, Trash2 } from "lucide-react";
import { deleteWorkspace } from "@/actions/workspace.action";
import { Button } from "@/components/ui/button";
import ConfirmDialog from "@/components/dialog/ConfirmDialog";
import EditWorkspaceDialog from "@/components/dialog/EditWorkspaceDialog";

type Workspace = IWorkspace & {
  slug: string;
};

function WorkspaceHeader({
  workspace,
  isOwnerOrAdmin,
}: {
  workspace: Workspace;
  isOwnerOrAdmin: boolean;
}) {
  const router = useRouter();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const response = await deleteWorkspace(workspace.id);
      if (response.error) return toast.error(response.error);
      toast.success("Workspace deleted.");
      router.push("/workspaces");
    } catch {
      toast.error("An error occurred.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2 md:gap-4">
          <div className="size-8 md:size-12 rounded-xl bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center">
            <Briefcase className="size-4 md:size-6 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <h1 className="text-md md:text-2xl font-semibold">
              {workspace.name}
            </h1>
            {workspace.description && (
              <p className="text-sm text-muted-foreground">
                {workspace.description}
              </p>
            )}
          </div>
        </div>

        {isOwnerOrAdmin && (
          <div className="flex items-center gap-2">
            <EditWorkspaceDialog workspace={workspace} />
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

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Delete Workspace"
        description={
          <>
            Are you sure you want to delete{" "}
            <span className="font-semibold">{workspace.name}</span>?<br />
            All projects and tasks will be permanently deleted.
          </>
        }
        onConfirm={handleDelete}
        isLoading={isDeleting}
        confirmLabel="Delete Workspace"
      />
    </>
  );
}

export default WorkspaceHeader;
