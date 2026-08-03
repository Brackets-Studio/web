"use client";

import { useEffect } from "react";
import { useTheme } from "@/components/theme/theme-provider";

export function FaviconSwitcher() {
  const { theme } = useTheme();

  useEffect(() => {
    const favicon = document.getElementById("theme-favicon");
    favicon?.setAttribute(
      "href",
      theme === "dark" ? "/favicon-white.png" : "/favicon-dark.png",
    );
  }, [theme]);

  return null;
}
