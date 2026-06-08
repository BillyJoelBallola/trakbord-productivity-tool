"use client";

import { useState } from "react";
import { User, Lock, Trash2 } from "lucide-react";
import ProfileSection from "@/components/settings/ProfileSection";
import PasswordSection from "@/components/settings/PasswordSection";
import DangerSection from "@/components/settings/DangerSection";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

type User = {
  id: string;
  username: string;
  email: string;
  avatar: string | null;
};

const navItems = [
  { key: "profile", label: "Profile", icon: User },
  { key: "password", label: "Password", icon: Lock },
  { key: "danger", label: "Delete account", icon: Trash2, danger: true },
];

function SettingsShell({ user }: { user: User }) {
  const [active, setActive] = useState("profile");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl md:text-2xl font-semibold">Settings</h1>
        <p className="text-sm text-muted-foreground">
          Make changes to your account.
        </p>
      </div>

      {/* User header */}
      <div className="flex items-center gap-4 mb-6">
        <Avatar className="size-14">
          <AvatarFallback className="text-base font-medium bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
            {user.username.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div>
          <p className="font-medium">{user.username}</p>
          <p className="text-sm text-muted-foreground">{user.email}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b pb-4">
        <nav className="flex gap-1">
          {navItems.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActive(key)}
              className={cn(
                "flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors text-left cursor-pointer",
                active === key
                  ? "bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-medium"
                  : "text-muted-foreground hover:text-foreground hover:bg-neutral-100 dark:hover:bg-neutral-800",
              )}
            >
              <Icon className="size-4 shrink-0" />
              <span className="hidden md:block">{label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      <div>
        {active === "profile" && <ProfileSection user={user} />}
        {active === "password" && <PasswordSection />}
        {active === "danger" && <DangerSection />}
      </div>
    </div>
  );
}

export default SettingsShell;
