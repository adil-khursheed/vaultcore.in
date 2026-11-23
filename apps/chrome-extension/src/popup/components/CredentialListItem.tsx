import type { CredentialType, TCredential } from "@/lib/types";
import { getFaviconUrl } from "@/lib/favicon";
import { ChevronRightIcon } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@repo/ui/components/avatar";
import { Badge } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";
import { cn } from "@repo/ui/lib/utils";

interface CredentialListItemProps {
  credential: TCredential;
  onClick: () => void;
  isMatching?: boolean;
}

const typeLabels: Record<CredentialType, string> = {
  login: "login",
  card: "card",
  identity: "identity",
  note: "note",
  ssh_key: "ssh key",
};

export function CredentialListItem({
  credential,
  onClick,
  isMatching,
}: CredentialListItemProps) {
  const faviconUrl =
    credential.type === "login" ? getFaviconUrl(credential.url) : undefined;

  return (
    <Button
      variant="outline"
      onClick={onClick}
      className={cn(
        "relative h-auto w-full shrink-0 cursor-pointer justify-start overflow-hidden",
        isMatching &&
          "after:bg-primary after:absolute after:inset-y-0 after:left-0 after:w-1 after:content-['']",
      )}
    >
      <div className="flex w-full items-center justify-between gap-3">
        <div className="flex min-w-0 flex-1 items-center gap-4">
          <Avatar>
            <AvatarImage src={faviconUrl} />
            <AvatarFallback className="text-sm font-medium capitalize">
              {credential.title[0]}
            </AvatarFallback>
          </Avatar>

          <div className="flex min-w-0 flex-col gap-y-1 text-left">
            <div className="flex items-center gap-2">
              <p className="truncate font-medium">{credential.title}</p>
              <Badge
                variant="secondary"
                className="border-border bg-muted text-muted-foreground text-[10px] capitalize"
              >
                {typeLabels[credential.type]}
              </Badge>
            </div>
            {credential.username && (
              <p className="text-muted-foreground truncate text-xs">
                {credential.username}
              </p>
            )}
          </div>
        </div>

        <ChevronRightIcon className="text-muted-foreground size-4 shrink-0" />
      </div>
    </Button>
  );
}
