import Link from "next/link";
import { Button } from "@/components/ui/button";
import ModeToggle from "@/components/ModeToggle";
import { ProfileMenu } from "@/components/ProfileMenu";
import { Briefcase, Settings } from "lucide-react";
import { BreadcrumbLinkNav } from "./BreadcrumbLinkNav";

const navLinks = [
  { href: "/workspaces", label: "Workspaces", icon: Briefcase },
  { href: "/settings", label: "Settings", icon: Settings },
];

function Navbar({ username, email }: { username?: string; email?: string }) {
  return (
    <div className="sticky top-0 right-0 left-0 py-2 px-12 bg-neutral-50 dark:bg-neutral-900 border-b">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h1 className="font-bold font-mono text-muted-foreground">
            Trakbord
          </h1>
          {navLinks.map(({ href, label, icon: Icon }) => (
            <Button key={label} variant="outline" asChild>
              <Link href={href} className="flex items-center gap-2">
                <Icon className="size-4" />
                <span>{label}</span>
              </Link>
            </Button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <ModeToggle />
          <ProfileMenu username={username} email={email} />
        </div>
      </div>
    </div>
  );
}

export default Navbar;
