"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { deleteAccount } from "@/actions/user.action";
import { Button } from "@/components/ui/button";
import ConfirmDialog from "@/components/dialog/ConfirmDialog";
import InputWithLabel from "@/components/input/InputWithLabel";

function DangerSection() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [username, setUsername] = useState("");

  const handleDelete = async () => {
    if (username.trim().length === 0) return;
    setIsDeleting(true);

    try {
      const response = await deleteAccount(username);
      if (response?.error) return toast.error(response.error);
      router.push("/");
      router.refresh();
    } catch {
      toast.error("An error occurred.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-4">
      <p className="text-sm font-medium">Danger zone</p>
      <div className="flex items-center justify-between p-4 rounded-lg border border-red-200 dark:border-red-900/10 bg-red-50 dark:bg-red-950/10">
        <div>
          <p className="text-sm font-medium text-red-800 dark:text-red-200">
            Delete account
          </p>
          <p className="text-xs text-red-600 dark:text-red-400 mt-0.5">
            Permanently delete your account and all workspaces. This cannot be
            undone.
          </p>
        </div>
        <Button
          variant="outline"
          className="cursor-pointer"
          onClick={() => setOpen(true)}
        >
          <Trash2 className="size-3.5" />
          Delete
        </Button>
      </div>

      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        title="Delete account"
        description={
          <div className="grid gap-2 mt-4">
            <span>
              Are you sure you want to delete your account? All your workspaces,
              projects, and tasks will be permanently deleted.
            </span>
            <span className="font-semibold">
              To confirm, type your username in the box below.
            </span>
            <InputWithLabel
              id="username"
              label=""
              value={username}
              onChange={(value) => setUsername(value as string)}
              placeholder=""
            />
          </div>
        }
        onConfirm={handleDelete}
        isLoading={isDeleting}
        confirmLabel="Delete account"
      />
    </div>
  );
}

export default DangerSection;
