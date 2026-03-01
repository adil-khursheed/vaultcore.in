"use client";

import React, { useRef, useState } from "react";
import { useParams } from "next/navigation";
import { authClient } from "@/lib/auth/client";
import { useTRPC } from "@/lib/trpc/client";
import { encryptString } from "@/lib/utils";
import { IconPlus, IconUpload } from "@tabler/icons-react";
import { useMutation } from "@tanstack/react-query";
import Papa from "papaparse";
import { toast } from "sonner";

import { useVaultStore } from "@repo/store";
import { Button } from "@repo/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@repo/ui/components/dialog";

interface DashlaneRow {
  title: string;
  url: string;
  user_name: string;
  user_name_2?: string;
  user_name_3?: string;
  password?: string;
  note?: string;
  category?: string;
  otp?: string;
}

const ImportCSV = () => {
  const [isImporting, setIsImporting] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  // const { organization_slug } = useParams<{ organization_slug: string }>();

  const { vaultKey } = useVaultStore();

  const { data: activeOrganization } = authClient.useActiveOrganization();

  const trpc = useTRPC();

  const { mutate } = useMutation(
    trpc.credential.batchCreate.mutationOptions({}),
  );

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!vaultKey) {
      toast.error("Vault is locked. Please unlock your vault first.");
      return;
    }

    setIsImporting(true);

    Papa.parse<DashlaneRow>(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          const rows = results.data;
          if (rows.length === 0) {
            toast.error("CSV file is empty.");
            setIsImporting(false);
            return;
          }

          toast.info(`Encrypting ${rows.length} items...`);

          const encryptedCredentials = await Promise.all(
            rows.map(async (row) => {
              const title = row.title || "Untitled";
              const username = await encryptString(
                row.user_name || "",
                vaultKey,
              );
              const password = await encryptString(
                row.password || "",
                vaultKey,
              );
              const url = row.url
                ? await encryptString(row.url, vaultKey)
                : undefined;
              const note = row.note
                ? await encryptString(row.note, vaultKey)
                : undefined;

              return {
                title,
                username,
                password,
                url,
                note,
              };
            }),
          );

          mutate({
            organizationId: activeOrganization?.id!,
            credentials: encryptedCredentials,
          });

          toast.success(`Successfully imported ${rows.length} items.`);
          setIsOpen(false);
          // Clear file input
          if (fileInputRef.current) fileInputRef.current.value = "";
        } catch (error) {
          console.error("Import failed:", error);
          toast.error("Failed to import CSV. Please check the file format.");
        } finally {
          setIsImporting(false);
        }
      },
      error: (error) => {
        console.error("Parse error:", error);
        toast.error("Failed to parse CSV file.");
        setIsImporting(false);
      },
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant={"outline"} size={"sm"}>
          <IconPlus className="size-4" />
          <span className="sr-only md:not-sr-only">Import CSV</span>
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Import CSV</DialogTitle>
          <DialogDescription>
            Upload a CSV file exported from Dashlane to import your credentials.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center justify-center gap-4 py-8">
          <input
            type="file"
            accept=".csv"
            className="hidden"
            ref={fileInputRef}
            onChange={handleFileChange}
            disabled={isImporting}
          />

          <div
            className={`flex h-40 w-full cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed transition-colors ${
              isImporting
                ? "bg-muted cursor-not-allowed border-neutral-300"
                : "hover:bg-accent border-neutral-200"
            }`}
            onClick={() => !isImporting && fileInputRef.current?.click()}
          >
            <IconUpload className="mb-2 size-10 text-neutral-400" />
            <p className="text-sm text-neutral-500">
              {isImporting ? "Importing items..." : "Click to select CSV file"}
            </p>
          </div>

          <div className="w-full text-xs text-neutral-400">
            <p className="font-semibold text-neutral-500">Required Columns:</p>
            <p>title, url, user_name, password, note</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ImportCSV;
