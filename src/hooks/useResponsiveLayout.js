import { useEffect, useState } from "react";

export const MOBILE_BREAKPOINT = 768;

export function getIsMobileViewport() {
  if (typeof window === "undefined") {
    return false;
  }

  return window.innerWidth <= MOBILE_BREAKPOINT;
}

export function useResponsiveLayout() {
  const [isMobileLayout, setIsMobileLayout] = useState(getIsMobileViewport);

  useEffect(() => {
    if (typeof window === "undefined") {
      return undefined;
    }

    function handleResize() {
      setIsMobileLayout(getIsMobileViewport());
    }

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return {
    isMobileLayout
  };
}
