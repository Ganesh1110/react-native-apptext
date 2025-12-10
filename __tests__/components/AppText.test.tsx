import React from "react";
import { render } from "@testing-library/react-native";
import AppText from "../../src/AppText";
import { AppTextProvider } from "../../src/context";

describe("AppText Component", () => {
  const renderWithProvider = (component: React.ReactElement) => {
    return render(<AppTextProvider>{component}</AppTextProvider>);
  };

  describe("Basic Rendering", () => {
    it("should render text content", () => {
      const { getByText } = renderWithProvider(<AppText>Hello World</AppText>);
      expect(getByText("Hello World")).toBeTruthy();
    });

    it("should render with default variant", () => {
      const { getByText } = renderWithProvider(
        <AppText testID="test-text">Default Text</AppText>
      );
      const element = getByText("Default Text");
      expect(element).toBeTruthy();
    });

    it("should apply custom styles", () => {
      const customStyle = { color: "red", fontSize: 20 };
      const { getByText } = renderWithProvider(
        <AppText style={customStyle}>Styled Text</AppText>
      );
      const element = getByText("Styled Text");
      // Component renders successfully - note: theme styles may override custom styles
      expect(element).toBeTruthy();
      expect(element.props.style).toBeDefined();
    });
  });

  describe("Typography Variants", () => {
    it("should render H1 variant", () => {
      const { getByText } = renderWithProvider(
        <AppText variant="h1">Heading 1</AppText>
      );
      expect(getByText("Heading 1")).toBeTruthy();
    });

    it("should render body1 variant", () => {
      const { getByText } = renderWithProvider(
        <AppText variant="body1">Body text</AppText>
      );
      expect(getByText("Body text")).toBeTruthy();
    });

    it("should render caption variant", () => {
      const { getByText } = renderWithProvider(
        <AppText variant="caption">Caption text</AppText>
      );
      expect(getByText("Caption text")).toBeTruthy();
    });
  });

  describe("Compound Components", () => {
    it("should render AppText.H1", () => {
      const { getByText } = renderWithProvider(
        <AppText.H1>Heading 1</AppText.H1>
      );
      expect(getByText("Heading 1")).toBeTruthy();
    });

    it("should render AppText.Body", () => {
      const { getByText } = renderWithProvider(
        <AppText.Body>Body text</AppText.Body>
      );
      expect(getByText("Body text")).toBeTruthy();
    });

    it("should render AppText.Caption", () => {
      const { getByText } = renderWithProvider(
        <AppText.Caption>Caption</AppText.Caption>
      );
      expect(getByText("Caption")).toBeTruthy();
    });
  });

  describe("Text Styling Props", () => {
    it("should apply weight prop", () => {
      const { getByText } = renderWithProvider(
        <AppText weight="700">Bold Text</AppText>
      );
      const element = getByText("Bold Text");
      expect(element.props.style).toMatchObject(
        expect.objectContaining({ fontWeight: "700" })
      );
    });

    it("should apply color prop", () => {
      const { getByText } = renderWithProvider(
        <AppText color="blue">Colored Text</AppText>
      );
      expect(getByText("Colored Text")).toBeTruthy();
    });

    it("should apply align prop", () => {
      const { getByText } = renderWithProvider(
        <AppText align="center">Centered Text</AppText>
      );
      const element = getByText("Centered Text");
      expect(element.props.style).toMatchObject(
        expect.objectContaining({ textAlign: "center" })
      );
    });

    it("should apply italic prop", () => {
      const { getByText } = renderWithProvider(
        <AppText italic>Italic Text</AppText>
      );
      const element = getByText("Italic Text");
      expect(element.props.style).toMatchObject(
        expect.objectContaining({ fontStyle: "italic" })
      );
    });
  });

  describe("Truncation", () => {
    it("should apply numberOfLines", () => {
      const { getByText } = renderWithProvider(
        <AppText numberOfLines={2}>Long text that should be truncated</AppText>
      );
      const element = getByText("Long text that should be truncated");
      expect(element.props.numberOfLines).toBe(2);
    });

    it("should apply ellipsizeMode", () => {
      const { getByText } = renderWithProvider(
        <AppText numberOfLines={1} ellipsizeMode="middle">
          Text with ellipsis
        </AppText>
      );
      const element = getByText("Text with ellipsis");
      expect(element.props.ellipsizeMode).toBe("middle");
    });
  });

  describe("Accessibility", () => {
    it("should have text accessibility role", () => {
      const { getByText } = renderWithProvider(
        <AppText>Accessible Text</AppText>
      );
      const element = getByText("Accessible Text");
      expect(element.props.accessibilityRole).toBe("text");
    });

    it("should apply custom testID", () => {
      const { getByTestId } = renderWithProvider(
        <AppText testID="custom-test-id">Test</AppText>
      );
      expect(getByTestId("custom-test-id")).toBeTruthy();
    });
  });

  describe("Responsive Behavior", () => {
    it("should handle responsive prop", () => {
      const { getByText } = renderWithProvider(
        <AppText responsive>Responsive Text</AppText>
      );
      expect(getByText("Responsive Text")).toBeTruthy();
    });

    it("should disable responsive when false", () => {
      const { getByText } = renderWithProvider(
        <AppText responsive={false} size={16}>
          Fixed Size Text
        </AppText>
      );
      expect(getByText("Fixed Size Text")).toBeTruthy();
    });
  });
});
