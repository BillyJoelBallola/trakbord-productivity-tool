"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { UserPlus, UserMinus, Shield } from "lucide-react";
import {
  inviteMember,
  removeMember,
  updateMemberRole,
} from "@/actions/workspace.action";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import InputWithLabel from "@/components/input/InputWithLabel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ConfirmDialog from "@/components/dialog/ConfirmDialog";

type Member = {
  role: string;
  user: { id: string; username: string; email: string; avatar: string | null };
};

const roleColor: Record<string, string> = {
  OWNER:
    "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200",
  ADMIN: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  MEMBER:
    "bg-neutral-100 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-200",
  VIEWER: "bg-neutral-100 text-neutral-600",
};

function MemberList({
  members,
  workspaceId,
  currentUserId,
  isOwnerOrAdmin,
}: {
  members: Member[];
  workspaceId: string;
  currentUserId: string;
  isOwnerOrAdmin: boolean;
}) {
  const router = useRouter();
  const [inviteEmail, setInviteEmail] = useState("");
  const [isInviting, setIsInviting] = useState(false);
  const [confirmRemove, setConfirmRemove] = useState<string | null>(null);
  const [isRemoving, setIsRemoving] = useState(false);

  const handleInvite = async () => {
    if (!inviteEmail) return;
    setIsInviting(true);
    try {
      const response = await inviteMember(workspaceId, inviteEmail);
      if (response.error) return toast.error(response.error);
      toast.success("Member invited.");
      setInviteEmail("");
      router.refresh();
    } catch {
      toast.error("An error occurred.");
    } finally {
      setIsInviting(false);
    }
  };

  const handleRemove = async () => {
    if (!confirmRemove) return;
    setIsRemoving(true);
    try {
      const response = await removeMember(workspaceId, confirmRemove);
      if (response.error) return toast.error(response.error);
      toast.success("Member removed.");
      setConfirmRemove(null);
      router.refresh();
    } catch {
      toast.error("An error occurred.");
    } finally {
      setIsRemoving(false);
    }
  };

  const handleRoleChange = async (memberId: string, role: string) => {
    const response = await updateMemberRole(
      workspaceId,
      memberId,
      role as "ADMIN" | "MEMBER" | "VIEWER",
    );
    if (response.error) return toast.error(response.error);
    toast.success("Role updated.");
    router.refresh();
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Shield className="size-4 text-indigo-500" />
            Members ({members.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Invite */}
          {isOwnerOrAdmin && (
            <div className="flex gap-2">
              <InputWithLabel
                id="invite-email"
                label=""
                placeholder="Email address"
                value={inviteEmail}
                onChange={(v) => setInviteEmail(v as string)}
                containerClassName="flex-1"
              />
              <Button
                onClick={handleInvite}
                disabled={isInviting || !inviteEmail}
                size="icon"
                className="mt-0 self-end"
              >
                <UserPlus className="size-4" />
              </Button>
            </div>
          )}

          {/* Member list */}
          <div className="space-y-2">
            {members.map(({ user, role }) => (
              <div
                key={user.id}
                className="flex items-center gap-3 py-2 border-b last:border-0"
              >
                <Avatar className="size-8">
                  <AvatarFallback className="text-xs bg-indigo-100 text-indigo-600">
                    {user.username.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {user.username}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {user.email}
                  </p>
                </div>

                {isOwnerOrAdmin && role !== "OWNER" ? (
                  <Select
                    defaultValue={role}
                    onValueChange={(v) => handleRoleChange(user.id, v)}
                  >
                    <SelectTrigger size="sm" className="text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ADMIN">Admin</SelectItem>
                      <SelectItem value="MEMBER">Member</SelectItem>
                      <SelectItem value="VIEWER">Viewer</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <Badge className={roleColor[role]}>{role}</Badge>
                )}

                {isOwnerOrAdmin &&
                  role !== "OWNER" &&
                  user.id !== currentUserId && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-7 text-red-500 hover:bg-red-50 dark:hover:bg-red-950"
                      onClick={() => setConfirmRemove(user.id)}
                    >
                      <UserMinus className="size-3.5" />
                    </Button>
                  )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <ConfirmDialog
        open={!!confirmRemove}
        onOpenChange={(open) => !open && setConfirmRemove(null)}
        title="Remove Member"
        description="Are you sure you want to remove this member from the workspace?"
        onConfirm={handleRemove}
        isLoading={isRemoving}
        confirmLabel="Remove"
      />
    </>
  );
}

export default MemberList;
