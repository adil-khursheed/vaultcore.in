import React from "react";
import { Metadata } from "next";

import MigrationWizard from "./_components/migration-wizard";

export const metadata: Metadata = {
  title: "Security Upgrade | VaultCore",
  description: "Upgrade your VaultCore security keys.",
};

export default function MigratePage() {
  return <MigrationWizard />;
}
