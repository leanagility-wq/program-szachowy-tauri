import { useI18n } from "../i18n";

function LanguageSwitcher() {
  const { language, setLanguage } = useI18n();

  return (
    <div className="language-switcher" role="group" aria-label="Language switcher">
      <button
        type="button"
        className={`language-switcher-button${language === "pl" ? " active" : ""}`}
        onClick={() => setLanguage("pl")}
        aria-pressed={language === "pl"}
      >
        PL
      </button>
      <button
        type="button"
        className={`language-switcher-button${language === "en" ? " active" : ""}`}
        onClick={() => setLanguage("en")}
        aria-pressed={language === "en"}
      >
        EN
      </button>
    </div>
  );
}

export default LanguageSwitcher;
