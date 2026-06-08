import Link from "next/link";
import { Button } from "@/components/ui/button";
import ModeToggle from "@/components/ModeToggle";
import { ProfileMenu } from "@/components/ProfileMenu";
import { Briefcase, Settings } from "lucide-react";
import { Sidebar } from "@/components/Sidebar";
import Image from "next/image";

const navLinks = [
  { href: "/workspaces", label: "Workspaces", icon: Briefcase },
  { href: "/settings", label: "Settings", icon: Settings },
];

function Navbar({ username, email }: { username?: string; email?: string }) {
  return (
    <div className="sticky top-0 right-0 left-0 py-2 px-4 md:px-12 bg-neutral-50 dark:bg-neutral-900 border-b">
      <div className="flex items-center justify-between">
        {/* mobile nav */}
        <div className="block md:hidden">
          <Sidebar navLinks={navLinks} />
        </div>

        {/* web nav */}
        <div className="hidden md:flex items-center gap-2">
          <div className="flex items-center gap-1">
            <Image
              src="/trakbord-logo-gray.png"
              alt="trakbord-logo"
              width={14}
              height={14}
            />
            <h1 className="font-bold font-mono text-neutral-500">Trakbord</h1>
          </div>
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
