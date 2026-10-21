import React from "react";
import MigrationWizard from "./_components/migration-wizard";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Security Upgrade | VaultCore",
  description: "Upgrade your VaultCore security keys.",
};

export default function MigratePage() {
  return <MigrationWizard />;
}
