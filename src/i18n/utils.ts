export function getNestedValue(obj: Record<string, any>, path: string): any {
  if (!obj || typeof obj !== "object") return undefined;
  if (!path || typeof path !== "string") return undefined;

  return path.split(".").reduce((current, key) => {
    return current?.[key];
  }, obj);
}

export function interpolate(text: string, params: Record<string, any> = {}): string {
  return text.replace(/\{\{([^}]+)\}\}/g, (match, key) => {
    const trimmedKey = key.trim();
    const value = getNestedValue(params, trimmedKey);

    if (value === null || value === undefined) return match;
    if (typeof value === "object") {
      console.warn(`Cannot interpolate object for key: ${trimmedKey}`);
      return match;
    }
    return String(value);
  });
}
