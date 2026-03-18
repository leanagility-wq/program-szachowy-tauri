function isTauriRuntime() {
  return typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;
}

function getUserAgent() {
  if (typeof navigator === "undefined") {
    return "";
  }

  return navigator.userAgent || "";
}

export function getRuntimePlatform() {
  const userAgent = getUserAgent();
  const isAndroid = /Android/i.test(userAgent);
  const isWindows = /Windows/i.test(userAgent);

  if (isTauriRuntime() && isAndroid) {
    return "android";
  }

  if (isTauriRuntime() && isWindows) {
    return "windows";
  }

  if (isAndroid) {
    return "android";
  }

  if (isWindows) {
    return "windows";
  }

  return "desktop";
}

export function isMobilePlatform() {
  return getRuntimePlatform() === "android";
}

export function isDesktopPlatform() {
  return getRuntimePlatform() !== "android";
}
