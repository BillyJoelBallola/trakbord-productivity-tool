"use client";

import { useRouter } from "next/navigation";
import { FolderOpen, Plus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import CreateProjectDialog from "@/components/dialog/CreateProjectDialog";

type Project = {
  id: string;
  name: string;
  description: string | null;
  color: string;
  createdAt: Date;
  _count: { columns: number };
};

function ProjectList({
  projects,
  workspaceId,
  workspaceSlug,
  isOwnerOrAdmin,
}: {
  projects: Project[];
  workspaceId: string;
  workspaceSlug: string;
  isOwnerOrAdmin: boolean;
}) {
  const router = useRouter();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold">Projects ({projects.length})</h2>
        {isOwnerOrAdmin && <CreateProjectDialog workspaceId={workspaceId} />}
      </div>

      {projects.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-xl">
          <FolderOpen className="size-10 mx-auto mb-2 opacity-20" />
          <p className="font-medium">No projects yet.</p>
          <p className="text-sm">Create your first project to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {projects.map((project) => (
            <Card
              key={project.id}
              className="cursor-pointer hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors"
              onClick={() =>
                router.push(
                  `/workspaces/${workspaceSlug}/projects/${project.id}`,
                )
              }
            >
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3">
                  <div
                    className="size-3 rounded-full shrink-0"
                    style={{ backgroundColor: project.color }}
                  />
                  <p className="font-medium">{project.name}</p>
                </div>
                {project.description && (
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {project.description}
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  {project._count.columns} columns
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

export default ProjectList;
