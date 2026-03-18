import { useCallback, useMemo, useState } from "react";
import {
  DEFAULT_LANGUAGE,
  formatMessage,
  getInitialLanguage,
  I18nContext,
  LANGUAGE_STORAGE_KEY,
  messages,
  resolveLanguage
} from "./context";

export function I18nProvider({ children }) {
  const [language, setLanguageState] = useState(getInitialLanguage);

  const setLanguage = useCallback((nextLanguage) => {
    const resolvedLanguage = resolveLanguage(nextLanguage);
    setLanguageState(resolvedLanguage);

    if (typeof window !== "undefined") {
      window.localStorage.setItem(LANGUAGE_STORAGE_KEY, resolvedLanguage);
    }
  }, []);

  const t = useCallback(
    (key, variables) => {
      const template =
        messages[language]?.[key] ??
        messages[DEFAULT_LANGUAGE]?.[key] ??
        key;

      return formatMessage(template, variables);
    },
    [language]
  );

  const value = useMemo(
    () => ({
      language,
      setLanguage,
      t
    }),
    [language, setLanguage, t]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}
