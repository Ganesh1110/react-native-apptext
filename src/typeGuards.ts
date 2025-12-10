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
