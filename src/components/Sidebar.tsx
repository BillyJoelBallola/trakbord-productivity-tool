"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Briefcase,
  Settings,
  ArrowLeftToLine,
  ArrowRightFromLine,
  LogOut,
} from "lucide-react";
import { signOut } from "@/actions/auth.action";
import { Button } from "@/components/ui/button";
import ModeToggle from "@/components/ModeToggle";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const navLinks = [
  { href: "/workspaces", label: "Workspaces", icon: Briefcase },
  { href: "/settings", label: "Settings", icon: Settings },
];

type User = {
  id: string;
  username: string;
  email: string;
  avatar: string | null;
};

function Sidebar({
  user,
  isOpen,
  onToggle,
}: {
  user: User;
  isOpen: boolean;
  onToggle: () => void;
}) {
  const pathname = usePathname();

  return (
    <aside
      className={`${
        isOpen ? "w-64" : "w-16"
      } fixed left-0 top-0 h-screen border-r bg-background group duration-200 flex flex-col justify-between px-3 py-4 z-40`}
    >
      <div className="space-y-6">
        {/* Logo + Toggle */}
        <div className="flex items-center justify-between px-2">
          {isOpen && (
            <h1 className="text-xl font-bold font-mono">
              Trak<span className="text-indigo-500">bord</span>
            </h1>
          )}
          <button
            onClick={onToggle}
            className="p-1.5 rounded-lg text-muted-foreground hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            {isOpen ? (
              <ArrowLeftToLine className="size-4" />
            ) : (
              <ArrowRightFromLine className="size-4" />
            )}
          </button>
        </div>

        {/* Nav */}
        <nav className="space-y-1">
          {navLinks.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-2 py-2 rounded-lg text-sm font-medium transition-colors ${
                !isOpen && "justify-center"
              } ${
                pathname.startsWith(href)
                  ? "bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400"
                  : "text-muted-foreground hover:text-foreground hover:bg-neutral-100 dark:hover:bg-neutral-800"
              }`}
            >
              <Icon className="size-4 shrink-0" />
              {isOpen && label}
            </Link>
          ))}
        </nav>
      </div>

      {/* User + Actions */}
      <div className="space-y-2">
        {isOpen && (
          <div className="flex items-center gap-2 px-2 py-2 rounded-lg bg-neutral-50 dark:bg-neutral-900">
            <Avatar className="size-7">
              <AvatarFallback className="text-xs bg-indigo-100 text-indigo-600">
                {user.username.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user.username}</p>
              <p className="text-xs text-muted-foreground truncate">
                {user.email}
              </p>
            </div>
          </div>
        )}
        <div className={`flex ${!isOpen ? "flex-col" : ""} items-center gap-2`}>
          <div className={`${isOpen ? "flex-1" : ""}`}>
            <form action={signOut} className="w-full">
              <Button
                variant="outline"
                size={isOpen ? "default" : "icon"}
                className="w-full"
                type="submit"
              >
                <LogOut className="size-4" />
                {isOpen && "Sign Out"}
              </Button>
            </form>
          </div>
          <ModeToggle />
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
