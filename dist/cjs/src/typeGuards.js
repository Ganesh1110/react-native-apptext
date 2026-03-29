"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isString = isString;
exports.isPluralTranslation = isPluralTranslation;
exports.isValidNumber = isValidNumber;
exports.isValidDate = isValidDate;
function isString(value) {
    return typeof value === "string";
}
function isPluralTranslation(value) {
    return (typeof value === "object" &&
        value !== null &&
        "other" in value &&
        typeof value.other === "string");
}
function isValidNumber(value) {
    return typeof value === "number" && isFinite(value) && !isNaN(value);
}
function isValidDate(value) {
    return value instanceof Date && !isNaN(value.getTime());
}
