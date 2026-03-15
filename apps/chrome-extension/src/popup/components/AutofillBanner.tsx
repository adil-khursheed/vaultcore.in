import { ZapIcon } from "lucide-react";

import { Button } from "@repo/ui/components/button";

interface AutofillBannerProps {
  count: number;
  onAutofill: () => void;
}

export function AutofillBanner({ count, onAutofill }: AutofillBannerProps) {
  if (count === 0) return null;

  return (
    <div className="bg-primary/10 ring-primary/20 mx-3 mb-2 flex items-center justify-between rounded-lg px-3 py-2.5 ring-1">
      <div className="flex items-center gap-2">
        <ZapIcon className="text-primary size-4" />
        <span className="text-primary text-xs font-medium">
          {count} credential{count > 1 ? "s" : ""} match
          {count === 1 ? "es" : ""} this site
        </span>
      </div>
      <Button
        size="sm"
        onClick={onAutofill}
        className="h-7 px-2.5 text-xs shadow-none"
      >
        <ZapIcon className="mr-1 size-3" />
        Fill
      </Button>
    </div>
  );
}
