"use client";

import React from "react";
import { IconPlus } from "@tabler/icons-react";

import { Button } from "@repo/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@repo/ui/components/dialog";

const AddItemButton = () => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>
          <IconPlus className="size-4" />
          <span className="sr-only">Add New Vault Item</span>
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Item</DialogTitle>
          <DialogDescription>Add a new item to your vault.</DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};

export default AddItemButton;
