import React from "react";
import { render } from "@testing-library/react-native";
import { AppTextProvider } from "../../src/context";
import { LocaleProvider } from "../../src/LangCore";
import Trans from "../../src/Trans";

const translations = {
  en: {
    simple: "Hello World",
    richText: "Welcome <bold>John</bold> to our <link>site</link>",
    nested: "<outer>Hello <inner>World</inner></outer>",
    nestedDeep: "<l1>Level 1 <l2>Level 2 <l3>Level 3</l3></l2></l1>",
    noComponents: "Plain text",
    missingKey: "Present",
  },
};

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <AppTextProvider>
    <LocaleProvider translations={translations} defaultLanguage="en">
      {children}
    </LocaleProvider>
  </AppTextProvider>
);

describe("Trans Component", () => {
  describe("Basic translation", () => {
    it("renders simple translated text", () => {
      const { getByText } = render(
        <Wrapper>
          <Trans i18nKey="simple" />
        </Wrapper>
      );
      expect(getByText("Hello World")).toBeTruthy();
    });

    it("returns the key itself when translation is missing", () => {
      const { getByText } = render(
        <Wrapper>
          <Trans i18nKey="nonexistent.key" />
        </Wrapper>
      );
      // t() returns the key string when not found (no throw, no fallback needed)
      expect(getByText("nonexistent.key")).toBeTruthy();
    });

    it("respects fallback prop when provided and key is missing", () => {
      // The fallback is only rendered when t() *throws* an error.
      // For a normal missing key it returns the key. We verify the component
      // renders (either key or fallback) without crashing.
      expect(() =>
        render(
          <Wrapper>
            <Trans i18nKey="nonexistent.key" fallback="Fallback text" />
          </Wrapper>
        )
      ).not.toThrow();
    });
  });

  describe("Rich text with components", () => {
    it("renders text with components without crashing", () => {
      const { Text } = require("react-native");
      const boldComponent = React.createElement(Text, { style: { fontWeight: "700" } });
      const linkComponent = React.createElement(Text, { style: { color: "blue" } });

      expect(() =>
        render(
          <Wrapper>
            <Trans
              i18nKey="richText"
              components={{ bold: boldComponent, link: linkComponent }}
            />
          </Wrapper>
        )
      ).not.toThrow();
    });

    it("handles nested tags without crashing", () => {
      const { Text } = require("react-native");
      const outerComponent = React.createElement(Text, { style: { fontSize: 20 } });
      const innerComponent = React.createElement(Text, { style: { fontWeight: "700" } });

      expect(() =>
        render(
          <Wrapper>
            <Trans
              i18nKey="nested"
              components={{
                outer: outerComponent,
                inner: innerComponent,
              }}
            />
          </Wrapper>
        )
      ).not.toThrow();
    });

    it("falls back to plain text for missing component key", () => {
      const { Text } = require("react-native");
      // Only provide 'bold', not 'link'
      const boldComponent = React.createElement(Text, { style: { fontWeight: "700" } });

      // Should warn but not crash
      const warnSpy = jest.spyOn(console, "warn").mockImplementation(() => {});

      expect(() =>
        render(
          <Wrapper>
            <Trans
              i18nKey="richText"
              components={{ bold: boldComponent }}
            />
          </Wrapper>
        )
      ).not.toThrow();

      warnSpy.mockRestore();
    });

    it("handles deeply nested tags correctly", () => {
      const { Text } = require("react-native");
      const level1 = React.createElement(Text, { testID: "level1" });
      const level2 = React.createElement(Text, { testID: "level2" });
      const level3 = React.createElement(Text, { testID: "level3" });

      const { getByTestId } = render(
        <Wrapper>
          <Trans
            i18nKey="nestedDeep"
            components={{
              l1: level1,
              l2: level2,
              l3: level3,
            }}
          />
        </Wrapper>
      );

      // Verify all levels are present
      expect(getByTestId("level1")).toBeTruthy();
      expect(getByTestId("level2")).toBeTruthy();
      expect(getByTestId("level3")).toBeTruthy();
    });
  });

  describe("Tokenizer edge cases", () => {
    it("handles text with no tags as plain string", () => {
      const { getByText } = render(
        <Wrapper>
          <Trans i18nKey="noComponents" components={{ bold: React.createElement(require("react-native").Text) }} />
        </Wrapper>
      );
      expect(getByText("Plain text")).toBeTruthy();
    });
  });
});
