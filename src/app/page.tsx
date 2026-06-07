import { currentUser } from "@/actions/user.action";
import { redirect } from "next/navigation";

import SignInDialog from "@/components/dialog/SignInDialog";
import SignUpDialog from "@/components/dialog/SignUpDialog";

export default async function Home() {
  const user = await currentUser();
  if (user) redirect("/workspaces");

  return (
    <div className="min-h-screen grid place-items-center">
      <div className="text-center space-y-6">
        <div className="space-y-2">
          <h1 className="text-5xl font-bold font-mono">
            Trak<span className="text-indigo-500">bord</span>
          </h1>
          <p className="text-muted-foreground">
            Project management for teams. Simple, fast, real-time.
          </p>
        </div>
        <div className="flex items-center justify-center gap-3">
          <SignInDialog />
          <SignUpDialog />
        </div>
      </div>
    </div>
  );
}
