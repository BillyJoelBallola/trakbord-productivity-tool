import { getWorkspace } from "@/actions/workspace.action";
import { currentUser } from "@/actions/user.action";
import { notFound } from "next/navigation";
import WorkspaceHeader from "@/components/workspace/WorkspaceHeader";
import ProjectList from "@/components/project/ProjectList";
import MemberList from "@/components/workspace/MemberList";

export const dynamic = "force-dynamic";

export default async function WorkspacePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [workspace, user] = await Promise.all([
    getWorkspace(slug),
    currentUser(),
  ]);

  if (!workspace || !user) return notFound();

  const myMember = workspace.members.find((m) => m.user.id === user.id);
  const isOwnerOrAdmin =
    myMember?.role === "OWNER" || myMember?.role === "ADMIN";

  return (
    <div className="space-y-8">
      <WorkspaceHeader
        workspace={workspace}
        isOwnerOrAdmin={isOwnerOrAdmin ?? false}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Projects */}
        <div className="lg:col-span-2 space-y-4">
          <ProjectList
            projects={workspace.projects}
            workspaceId={workspace.id}
            workspaceSlug={slug}
            isOwnerOrAdmin={isOwnerOrAdmin ?? false}
          />
        </div>

        {/* Members */}
        <div className="space-y-4">
          <MemberList
            members={workspace.members}
            workspaceId={workspace.id}
            currentUserId={user.id}
            isOwnerOrAdmin={isOwnerOrAdmin ?? false}
          />
        </div>
      </div>
    </div>
  );
}
