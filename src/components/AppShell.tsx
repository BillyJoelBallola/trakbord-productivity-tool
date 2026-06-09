"use client";

import { BreadcrumbLinkNav } from "@/components/BreadcrumbLinkNav";
import Navbar from "@/components/Navbar";

function AppShell({
  user,
  children,
}: {
  user: IUser;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen relative">
      <Navbar username={user.username} email={user.email} />
      <main className="w-full px-4 md:px-12">
        <BreadcrumbLinkNav />
        <div className="pt-4 pb-8">{children}</div>
      </main>
    </div>
  );
}

export default AppShell;
