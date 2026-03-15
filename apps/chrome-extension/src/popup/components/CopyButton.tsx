import { useState } from "react";
import { CheckIcon, CopyIcon } from "lucide-react";

import { Button } from "@repo/ui/components/button";

interface CopyButtonProps {
  text: string;
  label?: string;
}

export function CopyButton({ text, label }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement("textarea");
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <Button
      variant="ghost"
      onClick={handleCopy}
      className={`h-8 px-2 text-xs transition-colors ${
        copied ? "text-primary hover:text-primary" : "text-muted-foreground"
      }`}
      title={`Copy ${label || "text"}`}
    >
      {copied ? (
        <>
          <CheckIcon className="mr-1 size-3.5" />
          <span>Copied</span>
        </>
      ) : (
        <>
          <CopyIcon className="mr-1 size-3.5" />
          {label && <span>{label}</span>}
        </>
      )}
    </Button>
  );
}
