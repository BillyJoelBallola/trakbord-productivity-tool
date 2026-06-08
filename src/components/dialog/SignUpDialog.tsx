"use client";

import { useState } from "react";
import { toast } from "sonner";
import { signUp } from "@/actions/auth.action";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import InputWithLabel from "@/components/input/InputWithLabel";
import { Turnstile } from "@marsidev/react-turnstile";
import { Loader } from "lucide-react";

function SignUpDialog() {
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const setDefault = () => {
    setFormData({
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
    });
  };

  const isDisabled =
    isLoading ||
    !formData.username ||
    !formData.email ||
    !formData.password ||
    !formData.confirmPassword;

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (!turnstileToken) return toast.error("Please complete the captcha.");

      const signUpRes = await signUp({
        ...formData,
        turnstileToken,
      });

      if (signUpRes.error) return toast.error(signUpRes.error);
      if (signUpRes.success) {
        setDefault();
        toast.success("Account created! Please sign in.");
      }
    } catch {
      toast.error("An error occurred while signing up.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog onOpenChange={() => setDefault()}>
      <DialogTrigger asChild>
        <Button>Sign Up</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Sign Up</DialogTitle>
          <DialogDescription>Create your Resumiq account.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <InputWithLabel
            id="reg-username"
            label="Username"
            placeholder="Enter username"
            value={formData.username}
            onChange={(value) =>
              setFormData((prev) => ({ ...prev, username: value as string }))
            }
          />
          <InputWithLabel
            id="reg-email"
            label="Email"
            placeholder="Enter email"
            value={formData.email}
            onChange={(value) =>
              setFormData((prev) => ({ ...prev, email: value as string }))
            }
          />
          <InputWithLabel
            id="reg-password"
            label="Password"
            type="password"
            placeholder="Enter password"
            value={formData.password}
            onChange={(value) =>
              setFormData((prev) => ({ ...prev, password: value as string }))
            }
          />
          <InputWithLabel
            id="reg-confirmPassword"
            label="Confirm Password"
            type="password"
            placeholder="Confirm password"
            value={formData.confirmPassword}
            onChange={(value) =>
              setFormData((prev) => ({
                ...prev,
                confirmPassword: value as string,
              }))
            }
          />

          {/* Catcha */}
          <Turnstile
            siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY!}
            onSuccess={(token) => setTurnstileToken(token)}
            onExpire={() => setTurnstileToken(null)}
          />

          <Button type="submit" disabled={isDisabled} className="w-full">
            {isLoading ? (
              <>
                <Loader className="size-4 animate-spin" />
                Creating account...
              </>
            ) : (
              "Sign Up"
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default SignUpDialog;
