import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { LucideIcon, PanelRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

type navLinksProp = {
  href: string;
  label: string;
  icon: LucideIcon;
};

export function Sidebar({ navLinks }: { navLinks: navLinksProp[] }) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon">
          <PanelRight className="size-4" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" aria-describedby="">
        <SheetHeader>
          <SheetTitle asChild>
            <div className="flex items-center gap-1">
              <Image
                src="/trakbord-logo-gray.png"
                alt="trakbord-logo"
                width={14}
                height={14}
              />
              <h1 className="font-bold font-mono text-neutral-500">Trakbord</h1>
            </div>
          </SheetTitle>
        </SheetHeader>
        <div className="grid px-4">
          {navLinks.map(({ href, label, icon: Icon }) => (
            <Button key={label} variant="ghost" asChild>
              <Link
                href={href}
                className="flex items-center justify-start gap-2"
              >
                <Icon className="size-4" />
                <span>{label}</span>
              </Link>
            </Button>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  );
}
