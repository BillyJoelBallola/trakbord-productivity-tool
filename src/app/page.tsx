import SignInDialog from "@/components/dialog/SignInDialog";
import SignUpDialog from "@/components/dialog/SignUpDialog";
import { Zap, LayoutList, ShieldCheck, Users, Play } from "lucide-react";
import { currentUser } from "@/actions/user.action";
import ModeToggle from "@/components/ModeToggle";
import { Button } from "@/components/ui/button";
import { redirect } from "next/navigation";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const features = [
  {
    icon: Zap,
    label: "Real-time sync",
    desc: "See changes instantly as your team works.",
    bg: "bg-indigo-50 dark:bg-indigo-950",
    color: "text-indigo-600 dark:text-indigo-400",
  },
  {
    icon: LayoutList,
    label: "Kanban & list views",
    desc: "Switch between board and list layouts.",
    bg: "bg-teal-50 dark:bg-teal-950",
    color: "text-teal-700 dark:text-teal-400",
  },
  {
    icon: ShieldCheck,
    label: "Role-based access",
    desc: "Owner, admin, member, and viewer roles.",
    bg: "bg-orange-50 dark:bg-orange-950",
    color: "text-orange-700 dark:text-orange-400",
  },
  {
    icon: Users,
    label: "Team workspaces",
    desc: "Organize teams across multiple workspaces.",
    bg: "bg-blue-50 dark:bg-blue-950",
    color: "text-blue-700 dark:text-blue-400",
  },
];

const PREVIEW_COLUMNS = [
  {
    name: "Todo",
    accent: "bg-neutral-400",
    tasks: [
      { title: "Design system tokens", priority: "MEDIUM", assignee: "BJ" },
      { title: "Write unit tests", priority: "LOW", assignee: "MR" },
    ],
  },
  {
    name: "In Progress",
    accent: "bg-blue-400",
    tasks: [
      {
        title: "Fix auth bug",
        priority: "URGENT",
        assignee: "BJ",
        comments: 3,
      },
    ],
  },
  {
    name: "Review",
    accent: "bg-yellow-400",
    tasks: [{ title: "Landing page copy", priority: "MEDIUM", assignee: "KL" }],
  },
  {
    name: "Done",
    accent: "bg-green-500",
    tasks: [
      { title: "Set up CI/CD", priority: "LOW", assignee: "BJ", done: true },
    ],
  },
];

const priorityStyle: Record<string, string> = {
  LOW: "bg-neutral-100 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400",
  MEDIUM: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
  HIGH: "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300",
  URGENT: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
};

const avatarStyle: Record<string, string> = {
  BJ: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300",
  MR: "bg-teal-100 text-teal-700 dark:bg-teal-900 dark:text-teal-300",
  KL: "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300",
};

export default async function Home() {
  const user = await currentUser();
  if (user) redirect("/workspaces");

  return (
    <div className="min-h-screen">
      {/* Navbar */}
      <nav className="border-b px-6 py-3 flex items-center justify-between">
        <h1 className="text-lg font-semibold font-mono">
          Trak<span className="text-indigo-500">bord</span>
        </h1>
        <div className="flex items-center gap-2">
          <SignInDialog />
          <SignUpDialog />
          <ModeToggle />
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-16 space-y-12">
        {/* Hero text */}
        <div className="text-center space-y-5 relative">
          {/* pattern */}
          <div className="absolute inset-0 h-full w-full [&>div]:absolute [&>div]:h-full [&>div]:w-full [&>div]:bg-[radial-gradient(#858585_0.5px,transparent_1px)] [&>div]:bg-size-[16px_16px] [&>div]:mask-[radial-gradient(ellipse_50%_50%_at_50%_50%,#000_0%,transparent_100%)]">
            <div />
          </div>

          <div className="inline-flex items-center gap-1.5 bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 text-xs font-medium px-3 py-1.5 rounded-full">
            <Zap className="size-3" />
            Real-time collaboration
          </div>
          <h1 className="text-4xl md:text-5xl font-semibold leading-tight">
            Ship faster with your team.{" "}
            <span className="text-indigo-500">Stay in sync, always.</span>
          </h1>
          <p className="text-muted-foreground text-base max-w-xl mx-auto leading-relaxed">
            Trakbord is a project management tool built for teams who move fast.
            Kanban boards, real-time updates, and role-based access — all in one
            place.
          </p>
          <div className="flex items-center justify-center gap-2 md:gap-3 pt-2">
            <Button
              variant="outline"
              className="bg-indigo-500 dark:bg-indigo-500 text-neutral-50 rounded-md"
            >
              Get Started
            </Button>
            <Button variant="outline" className="rounded-md">
              <Play className="size-4" />
              See how it works
            </Button>
          </div>
        </div>

        {/* Kanban preview */}
        <div className="border rounded-xl overflow-hidden">
          {/* Browser bar */}
          <div className="flex items-center justify-between px-4 py-2.5 border-b bg-neutral-50 dark:bg-neutral-900">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium font-mono">
                Trak<span className="text-indigo-500">bord</span>
              </span>
              <span className="text-xs text-muted-foreground">/</span>
              <span className="text-xs text-muted-foreground">
                Website Redesign
              </span>
            </div>
            <div className="flex items-center">
              <div className="flex -space-x-2">
                {["BJ", "MR", "KL"].map((initials) => (
                  // <div
                  //   key={initials}
                  //   className={`size-6 rounded-full flex items-center justify-center text-[10px] font-medium ${avatarStyle[initials]}`}
                  // >
                  //   {initials}
                  // </div>
                  <Avatar
                    key={initials}
                    className="size-7 border-2 border-background"
                  >
                    <AvatarFallback
                      className={`flex items-center justify-center text-[10px] font-medium ${avatarStyle[initials]}`}
                    >
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                ))}
              </div>
              <span className="hidden md:block text-xs text-muted-foreground ml-1">
                3 online
              </span>
            </div>
          </div>

          {/* Board */}
          <div className="flex gap-3 p-3 bg-neutral-50/50 dark:bg-neutral-950 overflow-x-auto">
            {PREVIEW_COLUMNS.map((col) => (
              <div
                key={col.name}
                className="w-48 shrink-0 border rounded-lg overflow-hidden bg-background"
              >
                <div className="flex items-center gap-2 px-2.5 py-2 border-b bg-neutral-50 dark:bg-neutral-900">
                  <div className={`w-0.5 h-3.5 ${col.accent}`} />
                  <span className="text-xs font-medium">{col.name}</span>
                  <span className="text-[11px] text-muted-foreground border px-1.5 rounded-full ml-auto">
                    {col.tasks.length}
                  </span>
                </div>
                <div className="p-1.5 space-y-1.5">
                  {col.tasks.map((task) => (
                    <div
                      key={task.title}
                      className="border rounded-md p-2 space-y-1.5 bg-background"
                    >
                      <p
                        className={`text-xs leading-snug ${
                          "done" in task && task.done
                            ? "line-through text-muted-foreground"
                            : ""
                        }`}
                      >
                        {task.title}
                      </p>
                      <div className="flex items-center justify-between">
                        <span
                          className={`text-[10px] px-1.5 py-px rounded font-medium ${priorityStyle[task.priority]}`}
                        >
                          {task.priority}
                        </span>
                        <div
                          className={`size-5 rounded-full flex items-center justify-center text-[9px] font-medium ${avatarStyle[task.assignee]}`}
                        >
                          {task.assignee}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Feature grid */}
        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-3">
          {features.map(({ icon: Icon, label, desc, bg, color }) => (
            <div
              key={label}
              className="flex items-start gap-3 p-4 border rounded-xl bg-background"
            >
              <div
                className={`size-8 rounded-lg flex items-center justify-center shrink-0 ${bg}`}
              >
                <Icon className={`size-4 ${color}`} />
              </div>
              <div>
                <p className="text-sm font-medium">{label}</p>
                <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                  {desc}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Footer note */}
        <p className="text-center text-xs text-muted-foreground border-t pt-6">
          Design & Built by Billy Joel © {new Date().getFullYear()} Resumiq. All
          rights reserved.
        </p>
      </div>
    </div>
  );
}
