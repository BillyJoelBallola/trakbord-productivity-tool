import { useState } from "react";
import { Loader, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import InputWithLabel from "@/components/input/InputWithLabel";
import { addColumn } from "@/actions/project.action";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

function AddColumnDialog({ projectId }: { projectId: string }) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
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
        setName("");
        setIsOpen(false);
        router.refresh();
      }
    } catch (error) {
      toast.error("An error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Plus className="size-4" />
          <span className="hidden md:block">Add Column</span>
        </Button>
      </DialogTrigger>
      <DialogContent aria-describedby="">
        <DialogHeader>
          <DialogTitle>New Column</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <InputWithLabel
            id="column-name"
            placeholder="e.g. Todo"
            value={name}
            onChange={(value) => setName(value as string)}
          />

          <Button
            onClick={handleAddColumn}
            disabled={isDisabled}
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader className="size-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Add"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default AddColumnDialog;
