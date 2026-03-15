import type { CredentialType, TCredential } from "@/lib/types";
import {
  ChevronRightIcon,
  CreditCardIcon,
  FileTextIcon,
  GlobeIcon,
  KeyIcon,
  StarIcon,
  UserIcon,
} from "lucide-react";

import { Button } from "@repo/ui/components/button";

interface CredentialListItemProps {
  credential: TCredential;
  onClick: () => void;
  isMatching?: boolean;
}

const typeIcons: Record<CredentialType, React.ReactNode> = {
  login: <GlobeIcon className="size-4" />,
  card: <CreditCardIcon className="size-4" />,
  identity: <UserIcon className="size-4" />,
  note: <FileTextIcon className="size-4" />,
  ssh_key: <KeyIcon className="size-4" />,
};

const typeColors: Record<CredentialType, string> = {
  login: "bg-blue-500/10 text-blue-400",
  card: "bg-amber-500/10 text-amber-400",
  identity: "bg-violet-500/10 text-violet-400",
  note: "bg-emerald-500/10 text-emerald-400",
  ssh_key: "bg-rose-500/10 text-rose-400",
};

function getFaviconUrl(url: string | null): string | null {
  if (!url) return null;
  try {
    const parsed = new URL(url);
    return `https://www.google.com/s2/favicons?domain=${parsed.hostname}&sz=32`;
  } catch {
    return null;
  }
}

export function CredentialListItem({
  credential,
  onClick,
  isMatching,
}: CredentialListItemProps) {
  const faviconUrl = getFaviconUrl(credential.url);

  return (
    <Button
      variant="ghost"
      onClick={onClick}
      className={`group hover:bg-accent flex h-auto w-full items-center justify-start gap-3 rounded-lg px-3 py-2.5 font-normal transition-all ${
        isMatching ? "bg-primary/5 ring-primary/20 ring-1" : ""
      }`}
    >
      {/* Icon */}
      <div
        className={`flex size-9 shrink-0 items-center justify-center rounded-lg ${typeColors[credential.type]}`}
      >
        {credential.type === "login" && faviconUrl ? (
          <img
            src={faviconUrl}
            alt=""
            className="size-4 rounded-sm"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
              (e.target as HTMLImageElement).parentElement!.innerHTML =
                '<svg class="size-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>';
            }}
          />
        ) : (
          typeIcons[credential.type]
        )}
      </div>

      {/* Content */}
      <div className="flex min-w-0 flex-1 flex-col items-start gap-0.5 outline-none">
        <div className="flex items-center gap-1.5">
          <span className="text-foreground truncate text-sm font-medium">
            {credential.title}
          </span>
          {credential.isFavorite && (
            <StarIcon className="size-3 shrink-0 fill-amber-400 text-amber-400" />
          )}
        </div>
        {credential.username && (
          <span className="text-muted-foreground truncate text-xs">
            {credential.username}
          </span>
        )}
      </div>

      {/* Arrow */}
      <ChevronRightIcon className="text-muted-foreground size-4 shrink-0 opacity-0 transition-opacity group-hover:opacity-100" />
    </Button>
  );
}
