"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeClosed } from "lucide-react";
import { useState } from "react";

type InputWithLabelProps = {
  label?: string;
  type?: "text" | "number" | "password" | "email";
  placeholder?: string;
  className?: string;
  showPassClassName?: string;
  containerClassName?: string;
  id: string;
  onChange: (value: string | number) => void;
  value: string | number;
  required?: boolean;
} & React.HTMLAttributes<HTMLInputElement>;

const InputWithLabel = ({
  label,
  type,
  placeholder,
  onChange,
  className,
  showPassClassName,
  containerClassName,
  id,
  value,
  required,
  ...props
}: InputWithLabelProps) => {
  const [showPassword, setShowPassword] = useState(false);

  const resolvedType =
    type === "password" && showPassword ? "text" : (type ?? "text");

  return (
    <div className={`space-y-2 relative ${containerClassName}`}>
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        type={resolvedType}
        className={className ?? ""}
        placeholder={placeholder ?? "Enter text"}
        onChange={(e) => {
          const value = e.target.value;

          if (type === "number") {
            onChange(value === "" ? "" : Number(value));
          } else {
            onChange(value);
          }
        }}
        {...props}
        value={value}
        required={required ?? false}
      />
      {type === "password" && (
        <div
          className={`absolute right-3 top-8 flex items-center justify-end gap-1 text-muted-foreground ${showPassClassName}`}
        >
          <input
            hidden
            type="checkbox"
            id={`showPassword-${id}`}
            onChange={(e) => setShowPassword(e.target.checked)}
            value={value}
          />
          <label
            htmlFor={`showPassword-${id}`}
            className="cursor-pointer text-neutral-400 dark:text-neutral-600"
          >
            {showPassword ? (
              <Eye className="size-4" />
            ) : (
              <EyeClosed className="size-4" />
            )}
          </label>
        </div>
      )}
    </div>
  );
};

export default InputWithLabel;
