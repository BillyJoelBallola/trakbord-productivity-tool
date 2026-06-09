import { getProject } from "@/actions/project.action";
import { currentUser } from "@/actions/user.action";
import { notFound } from "next/navigation";

import KanbanBoard from "@/components/kanban/KanbanBoard";
import ProjectHeader from "@/components/project/ProjectHeader";
import ProjectViewList from "@/components/list/ProjectViewList";

export const dynamic = "force-dynamic";

export default async function ProjectPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string; id: string }>;
  searchParams: Promise<{ view?: string }>;
}) {
  const { id, slug } = await params;
  const { view = "kanban" } = await searchParams;
  const [project, user] = await Promise.all([getProject(id), currentUser()]);

  if (!project || !user) return notFound();

  const myMember = project.workspace.members.find((m) => m.user.id === user.id);
  const members = project.workspace.members.map((m) => m.user);
  const isViewer = myMember?.role === "VIEWER";

  return (
    <div className="space-y-4 h-full">
      <ProjectHeader
        project={project}
        workspaceSlug={slug}
        isViewer={isViewer ?? false}
        activeView={view}
        isOwnerOrAdmin={
          myMember?.role === "OWNER" || myMember?.role === "ADMIN"
        }
      />
      {view === "kanban" ? (
        <KanbanBoard
          project={project}
          members={members}
          isViewer={isViewer ?? false}
        />
      ) : (
        <ProjectViewList
          project={project}
          members={members}
          isViewer={isViewer ?? false}
        />
      )}
    </div>
  );
}
