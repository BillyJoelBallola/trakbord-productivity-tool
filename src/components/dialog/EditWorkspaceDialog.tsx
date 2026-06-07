"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Settings } from "lucide-react";
import { updateWorkspace } from "@/actions/workspace.action";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import InputWithLabel from "@/components/input/InputWithLabel";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader } from "lucide-react";

type Workspace = {
  id: string;
  name: string;
  description: string | null;
};

function EditWorkspaceDialog({ workspace }: { workspace: Workspace }) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: workspace.name,
    description: workspace.description ?? "",
  });

  const isDisabled = isLoading || formData.name.trim().length < 2;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await updateWorkspace(workspace.id, formData);
      if (response.error) return toast.error(response.error);
      toast.success("Workspace updated.");
      setIsOpen(false);
      router.refresh();
    } catch {
      toast.error("An error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon">
          <Settings className="size-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Workspace</DialogTitle>
          <DialogDescription>Update workspace details.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <InputWithLabel
            id="edit-workspace-name"
            label="Name"
            placeholder="Workspace name"
            value={formData.name}
            onChange={(v) =>
              setFormData((prev) => ({ ...prev, name: v as string }))
            }
          />
          <div className="space-y-2">
            <Label>Description (optional)</Label>
            <Textarea
              placeholder="What is this workspace for?"
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              className="resize-none"
              rows={3}
            />
          </div>
          <Button type="submit" disabled={isDisabled} className="w-full">
            {isLoading ? (
              <>
                <Loader className="size-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default EditWorkspaceDialog;
