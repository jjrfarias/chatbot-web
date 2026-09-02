import { useEffect } from "react";
import { useAuth } from "./AuthContext";

const DEFAULT_ACCENT = "#121210";

export function ThemeInjector() {
  const { session } = useAuth();
  const accent = session?.store.primaryColor || DEFAULT_ACCENT;

  useEffect(() => {
    document.documentElement.style.setProperty("--color-cr-accent", accent);
  }, [accent]);

  return null;
}
