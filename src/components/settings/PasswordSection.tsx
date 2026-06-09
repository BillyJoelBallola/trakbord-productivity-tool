"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Loader } from "lucide-react";
import { updatePassword } from "@/actions/user.action";
import { Button } from "@/components/ui/button";
import InputWithLabel from "@/components/input/InputWithLabel";

function PasswordSection() {
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const isDisabled =
    isSaving ||
    !formData.currentPassword ||
    !formData.newPassword ||
    !formData.confirmPassword;

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const response = await updatePassword(formData);
      if (response?.error) return toast.error(response.error);
      toast.success("Password updated.");
      setFormData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch {
      toast.error("An error occurred.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <p className="font-medium text-muted-foreground">Password information</p>

      <InputWithLabel
        id="current-password"
        label="Current password"
        type="password"
        value={formData.currentPassword}
        onChange={(value) =>
          setFormData((prev) => ({
            ...prev,
            currentPassword: value as string,
          }))
        }
        placeholder="Enter current password"
      />

      <div className="grid md:grid-cols-2 gap-4">
        <InputWithLabel
          id="new-password"
          label="New Password"
          type="password"
          value={formData.newPassword}
          onChange={(value) =>
            setFormData((prev) => ({
              ...prev,
              newPassword: value as string,
            }))
          }
          placeholder="Enter new password"
        />
        <InputWithLabel
          id="confirm-password"
          label="Confirm Password"
          type="password"
          value={formData.confirmPassword}
          onChange={(value) =>
            setFormData((prev) => ({
              ...prev,
              confirmPassword: value as string,
            }))
          }
          placeholder="Enter confirm password"
        />
      </div>
      <div className="flex justify-center md:justify-end">
        <Button type="submit" disabled={isDisabled} className="w-full md:w-fit">
          {isSaving && <Loader className="size-3.5 animate-spin" />}
          Update password
        </Button>
      </div>
    </form>
  );
}

export default PasswordSection;
