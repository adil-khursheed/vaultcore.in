"use client";

import React from "react";

import {
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@repo/ui/components/dialog";

import CreateOrgForm from "../../../_components/create-org-form";

const CreateOrgDialog = () => {
  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Create Organization</DialogTitle>
        <DialogDescription>
          Create a new organization to manage your credentials.
        </DialogDescription>
      </DialogHeader>

      <CreateOrgForm variant="dialog" />
    </DialogContent>
  );
};

export default CreateOrgDialog;
