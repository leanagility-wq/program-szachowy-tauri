const OPENING_NAME_TRANSLATIONS = {
  "caro-kann": { pl: "Caro-Kann", en: "Caro-Kann" },
  "italian-game": { pl: "Partia włoska", en: "Italian Game" },
  "queens-gambit": { pl: "Gambit hetmański", en: "Queen's Gambit" },
  "london-system": { pl: "System londyński", en: "London System" },
  "english-opening": { pl: "Partia angielska", en: "English Opening" },
  "four-knights": { pl: "Partia czterech skoczków", en: "Four Knights Game" },
  "scotch-game": { pl: "Partia szkocka", en: "Scotch Game" },
  "scandinavian-defense": { pl: "Obrona skandynawska", en: "Scandinavian Defense" },
  "petroff-defense": { pl: "Obrona rosyjska (Petroff)", en: "Petrov's Defense" },
  "slav-defense": { pl: "Obrona słowiańska", en: "Slav Defense" },
  "queens-gambit-declined": {
    pl: "Gambit hetmański odrzucony",
    en: "Queen's Gambit Declined"
  },
  "defense-vs-scholars-mate": {
    pl: "Obrona przed matem szewskim",
    en: "Defense against Scholar's Mate"
  },
  "vienna-game": { pl: "Partia wiedeńska", en: "Vienna Game" },
  "giuoco-pianissimo": { pl: "Giuoco Pianissimo", en: "Giuoco Pianissimo" },
  "colle-system": { pl: "System Colle", en: "Colle System" },
  "exchange-french": {
    pl: "Wymiana w obronie francuskiej",
    en: "French Defense Exchange Variation"
  },
  "french-defense": { pl: "Obrona francuska", en: "French Defense" },
  "pirc-defense": { pl: "Obrona Pirca", en: "Pirc Defense" },
  "sicilian-defense": { pl: "Obrona sycylijska", en: "Sicilian Defense" },
  "kings-indian-defense": {
    pl: "Obrona królewsko-indyjska",
    en: "King's Indian Defense"
  },
  "philidor-defense": { pl: "Obrona Philidora", en: "Philidor Defense" }
};

function resolveOpeningLanguage(language) {
  return language === "en" ? "en" : "pl";
}

export function getLocalizedOpeningName(opening, language) {
  if (!opening) {
    return "";
  }

  const resolvedLanguage = resolveOpeningLanguage(language);
  return OPENING_NAME_TRANSLATIONS[opening.id]?.[resolvedLanguage] || opening.name || "";
}

export function localizeOpenings(openings, language) {
  return openings.map((opening) => ({
    ...opening,
    name: getLocalizedOpeningName(opening, language)
  }));
}
