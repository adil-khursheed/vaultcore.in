"use client";

import React from "react";
import { authClient } from "@/lib/auth/client";
import { FingerprintIcon, CopyIcon } from "lucide-react";
import { toast } from "sonner";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/card";
import { Button } from "@repo/ui/components/button";

export default function SecurityFingerprint() {
  const { data: session } = authClient.useSession();
  const fingerprint = (session?.user as any)?.publicKeyFingerprint as
    | string
    | null;

  const handleCopy = () => {
    if (fingerprint) {
      navigator.clipboard.writeText(fingerprint);
      toast.success("Fingerprint copied to clipboard");
    }
  };

  if (!fingerprint) {
    return (
      <Card className="max-w-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <FingerprintIcon className="size-4" /> Key Fingerprint
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
    <Card className="max-w-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <FingerprintIcon className="size-4" /> Your Key Fingerprint
        </CardTitle>
        <CardDescription>
          This fingerprint uniquely identifies your encryption key. Share it with
          your organization admin to verify your identity before being granted
          vault access.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-3 rounded-md bg-muted p-4">
          <code className="flex-1 break-all font-mono text-sm tracking-wider text-primary">
            {fingerprint}
          </code>
          <Button variant="outline" size="sm" onClick={handleCopy}>
            <CopyIcon className="mr-2 size-4" /> Copy
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          Verify this fingerprint out-of-band (in person, over a call, or via QR
          code) — similar to how Signal verifies Safety Numbers. If someone asks
          you to verify your fingerprint, read these characters aloud or share
          them visually.
        </p>
      </CardContent>
    </Card>
  );
}
