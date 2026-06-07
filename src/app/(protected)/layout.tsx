import { currentUser } from "@/actions/user.action";
import { redirect } from "next/navigation";
import AppShell from "@/components/AppShell";

export const dynamic = "force-dynamic";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await currentUser();
  if (!user) redirect("/");

  return <AppShell user={user}>{children}</AppShell>;
}
