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
        <Button variant={"outline"} size={"sm"}>
          <IconPlus className="size-4" />
          <span className="sr-only md:not-sr-only">Import CSV</span>
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
