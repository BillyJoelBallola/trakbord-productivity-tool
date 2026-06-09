"use client";

import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { Briefcase, FolderOpen, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { roleColor } from "@/lib/colors";

type Workspace = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  createdAt: Date;
  members: {
    role: string;
    user: { id: string; username: string; avatar: string | null };
  }[];
  _count: { projects: number };
};

function WorkspaceList({
  currentUserId,
  workspaces,
}: {
  currentUserId: string | null;
  workspaces: Workspace[];
}) {
  const router = useRouter();

  if (workspaces.length === 0) {
    return (
      <div className="text-center py-16 text-muted-foreground">
        <Briefcase className="size-12 mx-auto mb-3 opacity-20" />
        <p className="font-medium">No workspaces yet.</p>
        <p className="text-sm">Create your first workspace to get started.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {workspaces.map((workspace) => {
        const currentMember = workspace.members.find(
          (member) => member.user.id === currentUserId,
        );
        const myRole = currentMember?.role ?? "MEMBER";

        return (
          <Card
            key={workspace.id}
            className="cursor-pointer hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors"
            onClick={() => router.push(`/workspaces/${workspace.slug}`)}
          >
            <CardContent className="space-y-4">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-lg bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center">
                    <Briefcase className="size-5 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div>
                    <p className="font-semibold">{workspace.name}</p>
                    {workspace.description && (
                      <p className="text-xs text-muted-foreground line-clamp-1">
                        {workspace.description}
                      </p>
                    )}
                  </div>
                </div>
                <Badge className={roleColor[myRole]}>{myRole}</Badge>
              </div>

              {/* Stats */}
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <FolderOpen className="size-4" />
                  <span>{workspace._count.projects} projects</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="size-4" />
                  <span>{workspace.members.length} members</span>
                </div>
              </div>

              {/* Members Avatars */}
              <div className="flex items-center justify-between">
                <div className="flex -space-x-2">
                  {workspace.members.slice(0, 4).map(({ user }) => (
                    <Avatar
                      key={user.id}
                      className="size-7 border-2 border-background"
                    >
                      <AvatarFallback className="text-xs bg-indigo-100 text-indigo-600">
                        {user.username.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  ))}
                  {workspace.members.length > 4 && (
                    <div className="size-7 rounded-full border-2 border-background bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-xs text-muted-foreground">
                      +{workspace.members.length - 4}
                    </div>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(workspace.createdAt), {
                    addSuffix: true,
                  })}
                </p>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

export default WorkspaceList;
