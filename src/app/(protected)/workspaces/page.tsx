import { currentUser } from "@/actions/user.action";
import { getWorkspaces } from "@/actions/workspace.action";
import WorkspaceList from "@/components/workspace/WorkspaceList";
import CreateWorkspaceDialog from "@/components/dialog/CreateWorkspaceDialog";

export const dynamic = "force-dynamic";

export default async function WorkspacesPage() {
  const user = await currentUser();
  const workspaces = await getWorkspaces();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Workspaces</h1>
          <p className="text-sm text-muted-foreground">
            Welcome back, {user?.username}!
          </p>
        </div>
        <CreateWorkspaceDialog />
      </div>
      <WorkspaceList workspaces={workspaces ?? []} />
    </div>
  );
}
