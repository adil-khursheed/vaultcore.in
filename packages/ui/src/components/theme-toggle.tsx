"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Moon, SunIcon } from "lucide-react";
import { Button } from "./button";

const ThemeToggle = () => {
  const { setTheme, resolvedTheme } = useTheme();

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <Button
      size={"icon"}
      variant={"ghost"}
      className="cursor-pointer"
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}>
      {resolvedTheme === "dark" ? (
        <SunIcon className="size-4 text-amber-400" />
      ) : (
        <Moon className="size-4 text-primary" />
      )}

      <span className="sr-only">Toggle Theme</span>
    </Button>
  );
};

export default ThemeToggle;
