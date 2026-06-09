import { createTask } from "@/actions/task.action";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export function AddTaskRow({
  columnId,
  projectId,
}: {
  columnId: string;
  projectId: string;
}) {
  const router = useRouter();
  const [isAdding, setIsAdding] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [title, setTitle] = useState("");

  const handleAdd = async () => {
    if (title.trim().length === 0) return;
    setIsLoading(true);

    try {
      const response = await createTask(projectId, {
        title: title.trim(),
        columnId,
      });

      if (response.error) {
        return toast.error(response.error);
      }

      if (response.task) {
        setTitle("");
        setIsAdding(false);
        router.refresh();
      }
    } catch (error) {
      return toast.error("An error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAdding) {
    return (
      <button
        onClick={() => setIsAdding(true)}
        className="flex items-center gap-1.5 w-full px-5 py-2 text-xs text-muted-foreground hover:text-foreground hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors"
      >
        <Plus className="size-3" />
        Add task
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2.5 px-3 py-2 border-t border-neutral-100 dark:border-neutral-800">
      <div className="size-1.5 rounded-full bg-neutral-300 shrink-0 ml-1" />
      <input
        autoFocus
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") handleAdd();
          if (e.key === "Escape") {
            setIsAdding(false);
            setTitle("");
          }
        }}
        placeholder="Task name..."
        className="flex-1 text-sm bg-transparent outline-none placeholder:text-muted-foreground text-neutral-800 dark:text-neutral-200"
      />
      <div className="flex items-center gap-1 shrink-0">
        <Button
          size="sm"
          className="h-6 text-xs px-2.5"
          onClick={handleAdd}
          disabled={isLoading}
        >
          {isLoading ? "Saving..." : "Save"}
        </Button>
        <Button
          size="sm"
          variant="ghost"
          className="h-6 text-xs px-2"
          onClick={() => {
            setIsAdding(false);
            setTitle("");
          }}
        >
          Cancel
        </Button>
      </div>
    </div>
  );
}
