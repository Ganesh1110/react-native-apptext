import React from "react";
import { AppTextProvider, LocaleProvider } from "../src";
import { translations as en } from "./translations";

const translations = { en };

export const decorators = [
  (Story) => (
    <LocaleProvider translations={translations} defaultLanguage="en">
      <AppTextProvider>
        <Story />
      </AppTextProvider>
    </LocaleProvider>
  ),
];

export const parameters = {
  actions: { argTypesRegex: "^on[A-Z].*" },
  controls: {
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/,
    },
  },
};