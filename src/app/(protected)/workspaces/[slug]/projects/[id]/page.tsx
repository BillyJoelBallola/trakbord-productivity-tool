import { getProject } from "@/actions/project.action";
import { currentUser } from "@/actions/user.action";
import { notFound } from "next/navigation";
import KanbanBoard from "@/components/kanban/KanbanBoard";
import ProjectHeader from "@/components/project/ProjectHeader";

export const dynamic = "force-dynamic";

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ slug: string; id: string }>;
}) {
  const { id, slug } = await params;
  const [project, user] = await Promise.all([getProject(id), currentUser()]);

  if (!project || !user) return notFound();

  const myMember = project.workspace.members.find((m) => m.user.id === user.id);
  const isViewer = myMember?.role === "VIEWER";
  const members = project.workspace.members.map((m) => m.user);

  return (
    <div className="space-y-4 h-full">
      <ProjectHeader
        project={project}
        workspaceSlug={slug}
        isOwnerOrAdmin={
          myMember?.role === "OWNER" || myMember?.role === "ADMIN"
        }
      />
      <KanbanBoard
        project={project}
        members={members}
        isViewer={isViewer ?? false}
      />
    </div>
  );
}
