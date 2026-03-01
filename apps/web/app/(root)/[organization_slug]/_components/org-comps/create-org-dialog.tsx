"use client";

import React from "react";

import { Button } from "@repo/ui/components/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
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

      <CreateOrgForm />
    </DialogContent>
  );
};

export default CreateOrgDialog;
