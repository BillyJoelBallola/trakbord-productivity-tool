import { currentUser } from "@/actions/user.action";
import { redirect } from "next/navigation";

import SignInDialog from "@/components/dialog/SignInDialog";
import SignUpDialog from "@/components/dialog/SignUpDialog";
import ModeToggle from "@/components/ModeToggle";

export default async function Home() {
  const user = await currentUser();
  if (user) redirect("/workspaces");

  return (
    <div className="min-h-screen grid place-items-center">
      <div className="absolute top-4 right-4 md:right-4">
        <ModeToggle />
      </div>
      <div className="grid place-items-center gap-4">
        <div className="space-y-2">
          <div className="flex items-center justify-center gap-2">
            <img src="/favicon-32x32.png" alt="trakbord-logo" />
            <h1 className="text-5xl font-bold font-mono">
              Trak<span className="text-indigo-500">bord</span>
            </h1>
          </div>
          <p className="text-center text-muted-foreground">
            Project management for teams. Simple, fast, real-time.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <SignInDialog />
          <SignUpDialog />
        </div>
      </div>
    </div>
  );
}
