"use client";

import React, { useState } from "react";
import { authClient } from "@/lib/auth/client";
import { buildVaultCsv, downloadCsv } from "@/lib/export-csv";
import { useTRPC } from "@/lib/trpc/client";
import { IconAlertTriangle, IconDownload } from "@tabler/icons-react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import type { RouterOutputs } from "@repo/api";
import { useVaultStore } from "@repo/store";
import { Button } from "@repo/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@repo/ui/components/dialog";

const ExportCSV = () => {
  const [isExporting, setIsExporting] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const { vaultKey } = useVaultStore();
  const { data: activeOrganization } = authClient.useActiveOrganization();
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const handleExport = async () => {
    if (!vaultKey) {
      toast.error("Vault is locked. Please unlock your vault first.");
      return;
    }

    const organizationId = activeOrganization?.id;
    if (!organizationId) {
      toast.error("No active organization found.");
      return;
    }

    setIsExporting(true);
    try {
      const allItems: RouterOutputs["credential"]["getCredentials"]["items"] =
        [];
      let cursor: string | undefined = undefined;

      do {
        const page: RouterOutputs["credential"]["getCredentials"] =
          await queryClient.fetchQuery(
            trpc.credential.getCredentials.queryOptions({
              organizationId,
              isDeleted: false,
              limit: 100,
              cursor,
            }),
          );
        allItems.push(...page.items);
        cursor = page.nextCursor ?? undefined;
      } while (cursor);

      if (allItems.length === 0) {
        toast.info("Your vault has no items to export.");
        setIsOpen(false);
        return;
      }

      const csv = await buildVaultCsv(allItems, vaultKey);
      const slug = activeOrganization.slug || "vault";
      const date = new Date().toISOString().slice(0, 10);
      downloadCsv(csv, `vaultcore-export-${slug}-${date}.csv`);

      toast.success(`Exported ${allItems.length} items.`);
      setIsOpen(false);
    } catch (error) {
      console.error("Export failed:", error);
      toast.error("Failed to export vault. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <IconDownload className="size-4" aria-hidden="true" />
          <span className="sr-only md:not-sr-only">Export CSV</span>
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Export CSV</DialogTitle>
          <DialogDescription>
            Decrypt and download all active items in this organization as a CSV
            file.
          </DialogDescription>
        </DialogHeader>

        <div className="border-destructive/40 bg-destructive/5 flex items-start gap-3 rounded-lg border p-3 text-sm">
          <IconAlertTriangle
            className="text-destructive mt-0.5 size-4 shrink-0"
            aria-hidden="true"
          />
          <p className="text-muted-foreground leading-relaxed">
            The exported file is <strong className="text-foreground">unencrypted plain text</strong>.
            Anyone with access to this file can read your passwords and secrets.
            Delete it once you&apos;re done.
          </p>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            disabled={isExporting}
            onClick={() => setIsOpen(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            disabled={isExporting}
            onClick={() => void handleExport()}
          >
            {isExporting ? "Exporting…" : "Download CSV"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ExportCSV;
