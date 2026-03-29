import { TranslationValue, PluralTranslation } from "./types";

export function isString(value: unknown): value is string {
  return typeof value === "string";
}

export function isPluralTranslation(
  value: TranslationValue
): value is PluralTranslation {
  return (
    typeof value === "object" &&
    value !== null &&
    "other" in value &&
    typeof value.other === "string"
  );
}

export function isValidNumber(value: unknown): value is number {
  return typeof value === "number" && isFinite(value) && !isNaN(value);
}

export function isValidDate(value: unknown): value is Date {
  return value instanceof Date && !isNaN(value.getTime());
}

export function isObject(value: unknown): value is object {
  return typeof value === "object" && value !== null;
}

export function isNumber(value: unknown): value is number {
  return typeof value === "number";
}

export function isBoolean(value: unknown): value is boolean {
  return typeof value === "boolean";
}

export function isFunction(value: unknown): value is Function {
  return typeof value === "function";
}

export function isArray(value: unknown): value is any[] {
  return Array.isArray(value);
}
