"use client";

import React, { useRef, useState } from "react";
import { authClient } from "@/lib/auth/client";
import { useTRPC } from "@/lib/trpc/client";
import { IconUpload } from "@tabler/icons-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import Papa from "papaparse";
import { toast } from "sonner";

import { encryptString } from "@repo/crypto";
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
  const [isDragging, setIsDragging] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { vaultKey } = useVaultStore();

  const { data: activeOrganization } = authClient.useActiveOrganization();

  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const { mutateAsync } = useMutation(
    trpc.credential.batchCreate.mutationOptions(),
  );

  const importFile = async (file: File) => {
    if (!vaultKey) {
      toast.error("Vault is locked. Please unlock your vault first.");
      return;
    }

    const organizationId = activeOrganization?.id;
    if (!organizationId) {
      toast.error("No active organization found.");
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
            return;
          }

          toast.info(`Encrypting ${rows.length} items...`);

          const encryptedCredentials = await Promise.all(
            rows.map(async (row) => {
              const title = row.title || "Untitled";
              const username = await encryptString(
                row.user_name || row.user_name_2 || row.user_name_3 || "",
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

              const mapCategory = (
                cat?: string,
              ): "login" | "card" | "identity" | "note" | "ssh_key" => {
                const lower = cat?.toLowerCase() || "";
                if (lower.includes("card")) return "card";
                if (lower.includes("identity") || lower.includes("personal"))
                  return "identity";
                if (lower.includes("note")) return "note";
                if (lower.includes("ssh") || lower.includes("key"))
                  return "ssh_key";
                return "login";
              };

              return {
                title,
                username,
                password,
                url,
                note,
                type: mapCategory(row.category),
              };
            }),
          );

          await mutateAsync({
            organizationId,
            credentials: encryptedCredentials,
          });

          await queryClient.invalidateQueries({
            queryKey: trpc.credential.getCredentials.pathKey(),
          });

          toast.success(`Successfully imported ${rows.length} items.`);
          setIsOpen(false);
        } catch (error) {
          console.error("Import failed:", error);
          toast.error("Failed to import CSV. Please check the file format.");
        } finally {
          setIsImporting(false);
          if (fileInputRef.current) fileInputRef.current.value = "";
        }
      },
      error: (error) => {
        console.error("Parse error:", error);
        toast.error("Failed to parse CSV file.");
        setIsImporting(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
      },
    });
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) void importFile(file);
  };

  const handleDrop = (event: React.DragEvent<HTMLButtonElement>) => {
    event.preventDefault();
    setIsDragging(false);

    if (isImporting) return;

    const file = event.dataTransfer.files?.[0];
    if (file) void importFile(file);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant={"outline"} size={"sm"}>
          <IconUpload className="size-4" aria-hidden="true" />
          <span className="sr-only md:not-sr-only">Import CSV</span>
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Import CSV</DialogTitle>
          <DialogDescription>
            Import logins from a Dashlane CSV. Items are encrypted on this
            device before they are uploaded.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center justify-center gap-4 py-6">
          <input
            type="file"
            accept=".csv,text/csv"
            className="hidden"
            ref={fileInputRef}
            onChange={handleFileChange}
            disabled={isImporting}
          />

          <button
            type="button"
            disabled={isImporting}
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(event) => {
              event.preventDefault();
              if (!isImporting) setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            className={`focus-visible:border-ring focus-visible:ring-ring/50 flex h-40 w-full flex-col items-center justify-center rounded-xl border-2 border-dashed transition-colors outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-60 ${
              isDragging
                ? "border-primary bg-primary/5"
                : "border-border hover:bg-accent"
            }`}
          >
            <IconUpload
              className="text-muted-foreground mb-2 size-8"
              aria-hidden="true"
            />
            <span className="text-sm font-medium">
              {isImporting
                ? "Importing items…"
                : isDragging
                  ? "Drop the CSV to import"
                  : "Choose a CSV file"}
            </span>
            <span className="text-muted-foreground mt-1 text-xs">
              or drag and drop it here
            </span>
          </button>

          <div className="text-muted-foreground w-full text-xs">
            <p className="text-foreground font-medium">Expected columns</p>
            <p className="mt-1 leading-relaxed">
              title, url, user_name, password, note, category, otp
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ImportCSV;
