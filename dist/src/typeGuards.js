export function isString(value) {
    return typeof value === "string";
}
export function isPluralTranslation(value) {
    return (typeof value === "object" &&
        value !== null &&
        "other" in value &&
        typeof value.other === "string");
}
export function isValidNumber(value) {
    return typeof value === "number" && isFinite(value) && !isNaN(value);
}
export function isValidDate(value) {
    return value instanceof Date && !isNaN(value.getTime());
}
