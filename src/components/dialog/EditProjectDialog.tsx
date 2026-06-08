"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader, Settings } from "lucide-react";
import { updateProject } from "@/actions/project.action";
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

const COLORS = [
  "#6366f1",
  "#8b5cf6",
  "#ec4899",
  "#ef4444",
  "#f97316",
  "#eab308",
  "#22c55e",
  "#14b8a6",
  "#3b82f6",
];

type Project = {
  id: string;
  name: string;
  color: string;
  description: string | null;
};

function EditProjectDialog({ project }: { project: Project }) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: project.name,
    description: project.description ?? "",
    color: project.color,
  });

  const isDisabled = isLoading || formData.name.trim().length < 2;

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await updateProject(project.id, formData);
      if (response.error) return toast.error(response.error);
      toast.success("Project updated.");
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
          <DialogTitle>Create Project</DialogTitle>
          <DialogDescription>
            A project contains a kanban board with tasks.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <InputWithLabel
            id="project-name"
            label="Name"
            placeholder="e.g. Website Redesign"
            value={formData.name}
            onChange={(v) =>
              setFormData((prev) => ({ ...prev, name: v as string }))
            }
          />
          <div className="space-y-2">
            <Label>Description (optional)</Label>
            <Textarea
              placeholder="What is this project about?"
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
          <div className="space-y-2">
            <Label>Color</Label>
            <div className="flex flex-wrap gap-2">
              {COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setFormData((prev) => ({ ...prev, color }))}
                  className={`size-7 rounded-full transition-transform ${
                    formData.color === color
                      ? "scale-110 ring-2 ring-offset-2 ring-neutral-400"
                      : "hover:scale-110"
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
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

export default EditProjectDialog;
