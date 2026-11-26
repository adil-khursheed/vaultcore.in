"use client";

import React, { useRef, useState } from "react";
import { authClient } from "@/lib/auth/client";
import {
  IMPORT_SOURCES,
  prepareEncryptedImportItems,
  type ImportSource,
} from "@/lib/import-csv";
import { useTRPC } from "@/lib/trpc/client";
import { IconUpload } from "@tabler/icons-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
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
import { Label } from "@repo/ui/components/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/components/select";

const CHUNK_SIZE = 100;

const ImportCSV = () => {
  const [source, setSource] = useState<ImportSource | "">("");
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

  const selectedSource = IMPORT_SOURCES.find((s) => s.id === source);

  const importFile = async (file: File) => {
    if (!source) {
      toast.error("Please select where your CSV was exported from first.");
      return;
    }

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

    Papa.parse<Record<string, string | undefined>>(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          const rows = results.data;
          if (rows.length === 0) {
            toast.error("CSV file is empty.");
            return;
          }

          toast.info(`Encrypting ${rows.length} items…`);
          const encrypted = await prepareEncryptedImportItems(
            rows,
            source,
            vaultKey,
          );

          for (let i = 0; i < encrypted.length; i += CHUNK_SIZE) {
            await mutateAsync({
              organizationId,
              credentials: encrypted.slice(i, i + CHUNK_SIZE),
            });
          }

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

    if (isImporting || !source) return;

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
            Choose your previous password manager and upload its CSV export.
            Items are encrypted on this device before upload.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="import-source">Import from</Label>
            <Select
              value={source}
              onValueChange={(value) => setSource(value as ImportSource)}
              disabled={isImporting}
            >
              <SelectTrigger id="import-source" className="w-full">
                <SelectValue placeholder="Select a password manager or browser" />
              </SelectTrigger>
              <SelectContent>
                {IMPORT_SOURCES.map((item) => (
                  <SelectItem key={item.id} value={item.id}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <input
            type="file"
            accept=".csv,text/csv"
            className="hidden"
            ref={fileInputRef}
            onChange={handleFileChange}
            disabled={isImporting || !source}
          />

          <button
            type="button"
            disabled={isImporting || !source}
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(event) => {
              event.preventDefault();
              if (!isImporting && source) setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            className={`focus-visible:border-ring focus-visible:ring-ring/50 flex h-40 w-full flex-col items-center justify-center rounded-xl border-2 border-dashed transition-colors outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 ${
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
                : !source
                  ? "Select a source above first"
                  : isDragging
                    ? "Drop the CSV to import"
                    : "Choose a CSV file"}
            </span>
            <span className="text-muted-foreground mt-1 text-xs">
              or drag and drop it here
            </span>
          </button>

          {selectedSource && (
            <div className="text-muted-foreground w-full text-xs">
              <p className="text-foreground font-medium">
                Expected columns ({selectedSource.label})
              </p>
              <p className="mt-1 leading-relaxed">
                {selectedSource.expectedColumns}
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ImportCSV;
