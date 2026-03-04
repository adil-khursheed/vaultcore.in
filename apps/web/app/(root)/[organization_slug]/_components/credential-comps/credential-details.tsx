"use client";

import React, { useEffect, useState } from "react";
import { TCredential } from "@/lib/types/types";
import { decryptString } from "@/lib/utils";
import {
  IconCheck,
  IconCopy,
  IconEye,
  IconEyeOff,
  IconLockPassword,
  IconTrash,
} from "@tabler/icons-react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { useCredentialStore, useVaultStore } from "@repo/store";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@repo/ui/components/avatar";
import { Button } from "@repo/ui/components/button";
import {
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@repo/ui/components/sheet";
import { useSidebar } from "@repo/ui/components/sidebar";

import DeleteCredential from "./delete-credential";
import EditCredential from "./edit-credential";
import MarkFavorite from "./mark-favorite";

const CopyableField = ({
  label,
  value,
  isSecret = false,
}: {
  label: string;
  value: string | undefined | null;
  isSecret?: boolean;
}) => {
  const [copied, setCopied] = useState(false);
  const [show, setShow] = useState(!isSecret);

  if (!value) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    toast.success(`${label} copied to clipboard`);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="group bg-accent/30 hover:bg-accent/50 flex flex-col gap-1.5 rounded-lg p-3 transition-colors">
      <span className="text-muted-foreground text-xs font-medium">{label}</span>
      <div className="flex items-center justify-between gap-2">
        <span className="flex-1 truncate text-sm font-medium">
          {isSecret && !show ? "•".repeat(12) : value}
        </span>
        <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
          {isSecret && (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => setShow(!show)}
            >
              {show ? (
                <IconEyeOff className="size-4" />
              ) : (
                <IconEye className="size-4" />
              )}
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={handleCopy}
          >
            {copied ? (
              <IconCheck className="size-4 text-emerald-500" />
            ) : (
              <IconCopy className="size-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

const CredentialDetails = () => {
  const [decryptedFields, setDecryptedFields] = useState<
    Record<string, string>
  >({});
  const [isLoading, setIsLoading] = useState(false);

  const { isMobile } = useSidebar();

  const { selectedCredential } = useCredentialStore();
  const { vaultKey } = useVaultStore();

  useEffect(() => {
    const decryptData = async () => {
      if (!selectedCredential || !vaultKey) return;
      setIsLoading(true);

      const decrypted: Record<string, string> = {};

      try {
        if (selectedCredential.type === "login") {
          if (selectedCredential.username)
            decrypted.username = await decryptString(
              selectedCredential.username,
              vaultKey,
            );
          if (selectedCredential.password)
            decrypted.password = await decryptString(
              selectedCredential.password,
              vaultKey,
            );
          if (selectedCredential.url)
            decrypted.url = await decryptString(
              selectedCredential.url,
              vaultKey,
            );
          if (selectedCredential.otp)
            decrypted.otp = await decryptString(
              selectedCredential.otp,
              vaultKey,
            );
        } else {
          if (
            selectedCredential.data &&
            typeof selectedCredential.data === "object"
          ) {
            for (const [key, value] of Object.entries(
              selectedCredential.data,
            )) {
              if (value && typeof value === "string") {
                decrypted[key] = await decryptString(value, vaultKey);
              }
            }
          }
        }

        setDecryptedFields(decrypted);
      } catch (err) {
        toast.error("Failed to decrypt some fields");
      } finally {
        setIsLoading(false);
      }
    };

    void decryptData();
  }, [selectedCredential, vaultKey]);

  if (!selectedCredential) {
    return (
      <div className="hidden flex-1 flex-col items-center justify-center gap-y-2 md:flex">
        <div className="bg-accent flex size-12 items-center justify-center rounded-full p-2">
          <IconLockPassword className="text-accent-foreground size-10" />
        </div>
        <div className="flex flex-col items-center gap-y-1">
          <h4 className="text-foreground font-semibold">
            No credential selected
          </h4>
          <p className="text-muted-foreground text-sm">
            Select a credential to view details
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      {isMobile ? (
        <SheetContent>
          <SheetHeader className="pb-0">
            <SheetTitle>Credential Details</SheetTitle>
            <SheetDescription className="sr-only">
              Selected Credential
            </SheetDescription>
          </SheetHeader>
          <SelectedCredential
            decryptedFields={decryptedFields}
            selectedCredential={selectedCredential}
            isLoading={isLoading}
          />
        </SheetContent>
      ) : (
        <SelectedCredential
          decryptedFields={decryptedFields}
          selectedCredential={selectedCredential}
          isLoading={isLoading}
        />
      )}
    </>
  );
};

export default CredentialDetails;

function SelectedCredential({
  decryptedFields,
  selectedCredential,
  isLoading,
}: {
  selectedCredential: TCredential;
  decryptedFields: Record<string, string>;
  isLoading: boolean;
}) {
  return (
    <div className="bg-background flex h-full flex-1 flex-col overflow-hidden">
      {/* Header Block */}
      <div className="flex shrink-0 items-center justify-between border-b p-4">
        <div className="flex min-w-0 items-center gap-3">
          <Avatar className="size-10 shrink-0">
            <AvatarImage
              src={
                selectedCredential.type === "login" && decryptedFields.url
                  ? `https://www.google.com/s2/favicons?domain=${decryptedFields.url}&sz=64`
                  : undefined
              }
            />

            <AvatarFallback className="bg-primary/10 text-primary">
              {selectedCredential.title.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex min-w-0 flex-col">
            <h2 className="truncate text-base font-semibold">
              {selectedCredential.title}
            </h2>
          </div>
        </div>

        {/* Actions */}
        <div className="flex shrink-0 items-center gap-1">
          <MarkFavorite />

          <EditCredential decryptedFields={decryptedFields} />

          <DeleteCredential />
        </div>
      </div>

      {/* Scrollable Fields container */}
      <div className="flex flex-1 flex-col gap-6 overflow-y-auto p-4">
        {isLoading ? (
          <div className="flex justify-center p-8">
            <Loader2 className="text-muted-foreground size-6 animate-spin" />
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {selectedCredential.type === "login" && (
              <>
                <CopyableField
                  label="Username"
                  value={decryptedFields.username}
                />
                <CopyableField
                  label="Password"
                  value={decryptedFields.password}
                  isSecret
                />
                <CopyableField
                  label="Website URL"
                  value={decryptedFields.url}
                />
                <CopyableField
                  label="Authenticator (OTP)"
                  value={decryptedFields.otp}
                />
              </>
            )}

            {selectedCredential.type === "card" && (
              <>
                <CopyableField
                  label="Cardholder Name"
                  value={decryptedFields.cardholderName}
                />
                <CopyableField
                  label="Card Number"
                  value={decryptedFields.cardNumber}
                  isSecret
                />
                <div className="grid grid-cols-2 gap-3">
                  <CopyableField label="Brand" value={decryptedFields.brand} />
                  <CopyableField
                    label="Expiry"
                    value={
                      decryptedFields.expiryMonth && decryptedFields.expiryYear
                        ? `${decryptedFields.expiryMonth}/${decryptedFields.expiryYear}`
                        : null
                    }
                  />
                </div>
                <CopyableField
                  label="CVV"
                  value={decryptedFields.cvv}
                  isSecret
                />
              </>
            )}

            {selectedCredential.type === "identity" && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <CopyableField
                    label="Title"
                    value={decryptedFields.identityTitle}
                  />
                  <CopyableField
                    label="First Name"
                    value={decryptedFields.firstName}
                  />
                  <CopyableField
                    label="Middle Name"
                    value={decryptedFields.middleName}
                  />
                  <CopyableField
                    label="Last Name"
                    value={decryptedFields.lastName}
                  />
                </div>
                <CopyableField
                  label="Username"
                  value={decryptedFields.username}
                />
                <CopyableField
                  label="Company"
                  value={decryptedFields.company}
                />
                <CopyableField
                  label="Social Security Number"
                  value={decryptedFields.socialSecurityNumber}
                  isSecret
                />
                <CopyableField
                  label="Passport Number"
                  value={decryptedFields.passportNumber}
                  isSecret
                />
                <CopyableField
                  label="License Number"
                  value={decryptedFields.licenseNumber}
                  isSecret
                />
                <CopyableField label="Email" value={decryptedFields.email} />
                <CopyableField label="Phone" value={decryptedFields.phone} />

                <div className="mt-2 flex flex-col gap-3 border-t pt-4">
                  <h3 className="text-muted-foreground px-1 text-sm font-medium">
                    Address Details
                  </h3>
                  <CopyableField
                    label="Address Line 1"
                    value={decryptedFields.address_1}
                  />
                  <CopyableField
                    label="Address Line 2"
                    value={decryptedFields.address_2}
                  />
                  <CopyableField
                    label="Address Line 3"
                    value={decryptedFields.address_3}
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <CopyableField
                      label="City"
                      value={decryptedFields.addressCity}
                    />
                    <CopyableField
                      label="State"
                      value={decryptedFields.addressState}
                    />
                    <CopyableField
                      label="Zip"
                      value={decryptedFields.addressZip}
                    />
                    <CopyableField
                      label="Country"
                      value={decryptedFields.addressCountry}
                    />
                  </div>
                </div>
              </>
            )}

            {selectedCredential.type === "ssh_key" && (
              <>
                <CopyableField
                  label="Public Key"
                  value={decryptedFields.publicKey}
                />
                <CopyableField
                  label="Private Key"
                  value={decryptedFields.privateKey}
                  isSecret
                />
                <CopyableField
                  label="Fingerprint"
                  value={decryptedFields.fingerprint}
                />
              </>
            )}

            {selectedCredential.note && (
              <div className="bg-accent/30 flex flex-col gap-1.5 rounded-lg p-3">
                <span className="text-muted-foreground text-xs font-medium">
                  Secure Note
                </span>
                <p className="text-sm whitespace-pre-wrap">
                  {selectedCredential.note}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
