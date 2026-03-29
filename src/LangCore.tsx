/**
 * LangCore.tsx
 * 
 * This file is now a thin wrapper around the modular i18n system.
 * It re-exports all components, hooks, and utilities for backward compatibility.
 */

export * from "./i18n";

// Types are still exported from here if needed, but they mostly live in types.ts
export type { 
  PluralTranslation, 
  TranslationValue, 
  Translations 
} from "./i18n/TranslationManager";
