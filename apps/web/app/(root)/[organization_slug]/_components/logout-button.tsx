"use client";

import React from "react";

import { Button } from "@repo/ui/components/button";

import { logout } from "../_actions/logout";

const LogoutButton = () => {
  return (
    <Button onClick={async () => await logout()} variant={"link"}>
      Logout
    </Button>
  );
};

export default LogoutButton;
