"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { signIn } from "@/actions/auth.action";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import InputWithLabel from "@/components/input/InputWithLabel";
// import { Turnstile } from "@marsidev/react-turnstile";
import { Loader } from "lucide-react";

function SignInDialog() {
  const router = useRouter();
  // const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({ username: "", password: "" });

  const isDisabled = isLoading || !formData.username || !formData.password;

  const setDefault = () => {
    setFormData({
      username: "",
      password: "",
    });
  };

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      // if (!turnstileToken) return toast.error("Please complete the captcha.");

      const response = await signIn({
        ...formData,
        // turnstileToken
      });
      if (response.error) return toast.error(response.error);
      if (response.success) {
        setDefault();
        router.push("/");
      }
    } catch {
      toast.error("An error occurred while signing in.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog onOpenChange={() => setDefault()}>
      <DialogTrigger asChild>
        <Button variant="outline">Sign In</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Sign In</DialogTitle>
          <DialogDescription>
            Sign in to your Resumiq account.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <InputWithLabel
            id="username"
            label="Username"
            placeholder="Enter username"
            value={formData.username}
            onChange={(value) =>
              setFormData((prev) => ({ ...prev, username: value as string }))
            }
          />
          <InputWithLabel
            id="password"
            label="Password"
            type="password"
            placeholder="Enter password"
            value={formData.password}
            onChange={(value) =>
              setFormData((prev) => ({ ...prev, password: value as string }))
            }
          />

          {/* Catcha */}
          {/* <Turnstile
            siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY!}
            onSuccess={(token) => setTurnstileToken(token)}
            onExpire={() => setTurnstileToken(null)}
          /> */}

          <Button type="submit" disabled={isDisabled} className="w-full">
            {isLoading ? (
              <>
                <Loader className="size-4 animate-spin" />
                Signing in...
              </>
            ) : (
              "Sign In"
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default SignInDialog;
