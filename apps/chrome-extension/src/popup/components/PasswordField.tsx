import { useState } from "react";
import { EyeIcon, EyeOffIcon } from "lucide-react";

import { Button } from "@repo/ui/components/button";

import { CopyButton } from "./CopyButton";

interface PasswordFieldProps {
  value: string;
  label?: string;
}

export function PasswordField({
  value,
  label = "Password",
}: PasswordFieldProps) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="flex items-center gap-2">
      <span className="text-foreground flex-1 truncate font-mono text-sm">
        {visible ? value : "••••••••••••"}
      </span>
      <Button
        variant="ghost"
        size="icon"
        className="text-muted-foreground hover:text-foreground size-8 transition-colors"
        onClick={() => setVisible(!visible)}
        title={visible ? "Hide password" : "Show password"}
      >
        {visible ? (
          <EyeOffIcon className="size-4" />
        ) : (
          <EyeIcon className="size-4" />
        )}
      </Button>
      <CopyButton text={value} label={label} />
    </div>
  );
}
