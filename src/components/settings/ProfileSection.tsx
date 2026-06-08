"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader } from "lucide-react";
import { updateProfile } from "@/actions/user.action";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import InputWithLabel from "@/components/input/InputWithLabel";

type User = { username: string; email: string };

function ProfileSection({ user }: { user: User }) {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    username: user.username,
    email: user.email,
  });

  const isDisabled = isSaving || !formData.username || !formData.email;

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const response = await updateProfile(formData);
      if (response?.error) return toast.error(response.error);
      toast.success("Profile updated.");
      router.refresh();
    } catch {
      toast.error("An error occurred.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <p className="font-medium text-muted-foreground">Profile information</p>

      <div className="grid md:grid-cols-2 gap-4">
        <InputWithLabel
          id="username"
          label="Username"
          value={formData.username}
          onChange={(value) =>
            setFormData((prev) => ({
              ...prev,
              username: value as string,
            }))
          }
          placeholder="Enter new username"
        />
        <InputWithLabel
          id="email"
          label="Email Address"
          value={formData.email}
          onChange={(value) =>
            setFormData((prev) => ({
              ...prev,
              email: value as string,
            }))
          }
          placeholder="Enter new email address"
        />
      </div>

      <div className="flex justify-center md:justify-end">
        <Button type="submit" disabled={isDisabled} className="w-full md:w-fit">
          {isSaving && <Loader className="size-3.5 animate-spin" />}
          Save changes
        </Button>
      </div>
    </form>
  );
}

export default ProfileSection;
