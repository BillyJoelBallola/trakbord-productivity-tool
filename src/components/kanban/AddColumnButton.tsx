"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Plus, X } from "lucide-react";
import { addColumn } from "@/actions/project.action";
import { Button } from "@/components/ui/button";

function AddColumnButton({
  projectId,
  onColumnAdded,
}: {
  projectId: string;
  onColumnAdded: (column: { id: string; name: string; order: number }) => void;
}) {
  const [isAdding, setIsAdding] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [name, setName] = useState("");

  const isDisabled = isLoading || name.trim().length < 3;

  const handleAddColumn = async () => {
    setIsLoading(true);

    try {
      const response = await addColumn(projectId, name.trim());
      if (response.error) {
        toast.error(response.error);
        return;
      }

      if (response.column) {
        onColumnAdded(response.column);
        setName("");
        setIsAdding(false);
      }
    } catch (error) {
      toast.error("An error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAdding) {
    return (
      <button
        onClick={() => setIsAdding(true)}
        className="flex items-center gap-2 w-72 shrink-0 h-12 px-4 rounded-xl border-2 border-dashed text-muted-foreground hover:text-foreground hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors text-sm"
      >
        <Plus className="size-4" />
        Add column
      </button>
    );
  }

  return (
    <div className="w-72 shrink-0 h-fit bg-neutral-50 dark:bg-neutral-900 rounded-xl border p-3 space-y-2">
      <input
        autoFocus
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") handleAddColumn();
          if (e.key === "Escape") {
            setIsAdding(false);
            setName("");
          }
        }}
        placeholder="Column name..."
        className="w-full text-sm p-2 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />
      <div className="flex items-center gap-2">
        <Button
          size="sm"
          className="flex-1"
          disabled={isDisabled}
          onClick={handleAddColumn}
        >
          {isLoading ? "Saving..." : "Add"}
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={() => {
            setIsAdding(false);
            setName("");
          }}
        >
          <X className="size-4" />
        </Button>
      </div>
    </div>
  );
}

export default AddColumnButton;
