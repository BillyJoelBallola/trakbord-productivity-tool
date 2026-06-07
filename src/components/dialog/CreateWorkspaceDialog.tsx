"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { createWorkspace } from "@/actions/workspace.action";
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

function CreateWorkspaceDialog() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });

  const isDisabled = isLoading || formData.name.trim().length < 2;

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await createWorkspace(formData);
      if (response.error) return toast.error(response.error);
      if (response.success) {
        toast.success("Workspace created.");
        setIsOpen(false);
        setFormData({ name: "", description: "" });
        router.refresh();
      }
    } catch {
      toast.error("An error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="size-4" />
          New Workspace
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Workspace</DialogTitle>
          <DialogDescription>
            A workspace is where your team collaborates on projects.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <InputWithLabel
            id="workspace-name"
            label="Name"
            placeholder="e.g. My Team"
            value={formData.name}
            onChange={(value) =>
              setFormData((prev) => ({ ...prev, name: value as string }))
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
                Creating...
              </>
            ) : (
              "Create Workspace"
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default CreateWorkspaceDialog;
