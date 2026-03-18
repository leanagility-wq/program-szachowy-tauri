import { getRuntimePlatform } from "../platform/runtime";

export const ENGINE_ELO_OPTIONS = [1320, 1400, 1500, 1600, 1800, 2000, 2200, 2400];

export const ENGINE_OPTIONS = [
  {
    id: "stockfish",
    label: "Stockfish",
    description: "Analiza i najlepszy ruch",
    supportedPlatforms: ["windows", "desktop"]
  },
  {
    id: "maia",
    label: "Maia",
    description: "Ruch ludzki",
    supportedPlatforms: ["windows", "desktop"],
    desktopOnly: true
  }
];

export function isSupportedEngine(engineId) {
  return ENGINE_OPTIONS.some((engine) => engine.id === engineId);
}

export function getEngineLabel(engineId) {
  return ENGINE_OPTIONS.find((engine) => engine.id === engineId)?.label || "Silnik";
}

export function isEngineAvailableOnPlatform(engineId, platform = getRuntimePlatform()) {
  return ENGINE_OPTIONS.some(
    (engine) => engine.id === engineId && engine.supportedPlatforms.includes(platform)
  );
}

export function getEngineOptionAvailability(platform = getRuntimePlatform()) {
  return ENGINE_OPTIONS.map((engine) => ({
    ...engine,
    isAvailable: engine.supportedPlatforms.includes(platform)
  }));
}

export function getEngineOptionLabel(engineId) {
  return ENGINE_OPTIONS.find((engine) => engine.id === engineId)?.label || "Engine";
}

export function hasEngineSupportOnPlatform(platform = getRuntimePlatform()) {
  return getEngineOptionAvailability(platform).some((engine) => engine.isAvailable);
}

export function getDefaultEngineForPlatform(platform = getRuntimePlatform()) {
  return (
    getEngineOptionAvailability(platform).find((engine) => engine.isAvailable)?.id || ""
  );
}
