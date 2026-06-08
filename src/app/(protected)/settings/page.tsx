import { currentUser } from "@/actions/user.action";
import SettingsShell from "@/components/settings/SettingsShell";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const user = await currentUser();
  if (!user) return null;

  return <SettingsShell user={user} />;
}
