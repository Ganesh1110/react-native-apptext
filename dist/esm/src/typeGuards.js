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
export function isObject(value) {
    return typeof value === "object" && value !== null;
}
export function isNumber(value) {
    return typeof value === "number";
}
export function isBoolean(value) {
    return typeof value === "boolean";
}
export function isFunction(value) {
    return typeof value === "function";
}
export function isArray(value) {
    return Array.isArray(value);
}
