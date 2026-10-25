"use client";

import React from "react";
import { authClient } from "@/lib/auth/client";
import { CheckIcon, CopyIcon, FingerprintIcon } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@repo/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/card";

export default function SecurityFingerprint() {
  const { data: session } = authClient.useSession();
  const [copied, setCopied] = React.useState(false);
  const fingerprint = (
    session?.user as { publicKeyFingerprint?: string | null } | undefined
  )?.publicKeyFingerprint;

  const handleCopy = async () => {
    if (!fingerprint) return;

    try {
      await navigator.clipboard.writeText(fingerprint);
      setCopied(true);
      toast.success("Fingerprint copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Could not copy fingerprint");
    }
  };

  if (!fingerprint) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <FingerprintIcon className="size-4" aria-hidden="true" /> Key
            Fingerprint
          </CardTitle>
          <CardDescription>
            Your account does not have a key fingerprint yet. This will be
            generated when you complete the security migration.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <FingerprintIcon className="size-4" aria-hidden="true" /> Your Key
          Fingerprint
        </CardTitle>
        <CardDescription>
          This fingerprint uniquely identifies your encryption key. Share it
          with your organization admin to verify your identity before being
          granted vault access.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-muted flex items-center gap-3 rounded-lg p-4">
          <code className="text-foreground min-w-0 flex-1 font-mono text-sm tracking-wider break-all">
            {fingerprint}
          </code>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="shrink-0"
            onClick={handleCopy}
          >
            {copied ? (
              <CheckIcon className="mr-2 size-4" aria-hidden="true" />
            ) : (
              <CopyIcon className="mr-2 size-4" aria-hidden="true" />
            )}
            {copied ? "Copied" : "Copy"}
          </Button>
        </div>
        <p className="text-muted-foreground text-xs">
          Verify this fingerprint out-of-band (in person, over a call, or via QR
          code) — similar to how Signal verifies Safety Numbers. If someone asks
          you to verify your fingerprint, read these characters aloud or share
          them visually.
        </p>
      </CardContent>
    </Card>
  );
}
