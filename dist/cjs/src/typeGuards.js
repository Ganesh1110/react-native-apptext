"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isString = isString;
exports.isPluralTranslation = isPluralTranslation;
exports.isValidNumber = isValidNumber;
exports.isValidDate = isValidDate;
exports.isObject = isObject;
exports.isNumber = isNumber;
exports.isBoolean = isBoolean;
exports.isFunction = isFunction;
exports.isArray = isArray;
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
function isObject(value) {
    return typeof value === "object" && value !== null;
}
function isNumber(value) {
    return typeof value === "number";
}
function isBoolean(value) {
    return typeof value === "boolean";
}
function isFunction(value) {
    return typeof value === "function";
}
function isArray(value) {
    return Array.isArray(value);
}
