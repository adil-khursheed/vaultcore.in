"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

import { useSidebar } from "@repo/ui/components/sidebar";

const SidebarAutoClose = () => {
  const pathname = usePathname();
  const { isMobile, setOpenMobile } = useSidebar();
  const previousPathname = useRef(pathname);

  useEffect(() => {
    if (isMobile && previousPathname.current !== pathname) {
      setOpenMobile(false);
    }
    previousPathname.current = pathname;
  }, [pathname, isMobile, setOpenMobile]);

  return null;
};

export default SidebarAutoClose;
