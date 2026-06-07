"use client";

import Navbar from "./Navbar";

type User = {
  id: string;
  username: string;
  email: string;
  avatar: string | null;
};

function AppShell({
  user,
  children,
}: {
  user: User;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen relative">
      <Navbar username={user.username} email={user.email} />
      <main className="w-full">
        <div className="px-12 py-4">{children}</div>
      </main>
    </div>
  );
}

export default AppShell;
