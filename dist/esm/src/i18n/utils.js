export function getNestedValue(obj, path) {
    if (!obj || typeof obj !== "object")
        return undefined;
    if (!path || typeof path !== "string")
        return undefined;
    return path.split(".").reduce((current, key) => {
        return current === null || current === void 0 ? void 0 : current[key];
    }, obj);
}
export function interpolate(text, params = {}) {
    return text.replace(/\{\{([^}]+)\}\}/g, (match, key) => {
        const trimmedKey = key.trim();
        const value = getNestedValue(params, trimmedKey);
        if (value === null || value === undefined)
            return match;
        if (typeof value === "object") {
            console.warn(`Cannot interpolate object for key: ${trimmedKey}`);
            return match;
        }
        return String(value);
    });
}
