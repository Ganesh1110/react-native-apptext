import React from "react";
import { render } from "@testing-library/react-native";
import AppText from "../../src/AppText";
import { AppTextProvider } from "../../src/context";

describe("Static Typography Variants", () => {
  const renderWithProvider = (component: React.ReactElement) => {
    return render(<AppTextProvider>{component}</AppTextProvider>);
  };

  it("should render all Material Design variants through dot notation", () => {
    const variants = [
      "DisplayLarge", "DisplayMedium", "DisplaySmall",
      "HeadlineLarge", "HeadlineMedium", "HeadlineSmall",
      "TitleLarge", "TitleMedium", "TitleSmall",
      "BodyLarge", "BodyMedium", "BodySmall",
      "LabelLarge", "LabelMedium", "LabelSmall"
    ];

    variants.forEach(variantName => {
      const Component = (AppText as any)[variantName];
      expect(Component).toBeDefined();
      const { getByText } = renderWithProvider(
        <Component>{variantName} Content</Component>
      );
      expect(getByText(`${variantName} Content`)).toBeTruthy();
    });
  });

  it("should render legacy variants through dot notation", () => {
    const legacyVariants = ["H1", "H2", "H3", "H4", "H5", "H6", "Title", "Body", "Caption"];

    legacyVariants.forEach(variantName => {
      const Component = (AppText as any)[variantName];
      expect(Component).toBeDefined();
      const { getByText } = renderWithProvider(
        <Component>{variantName} Content</Component>
      );
      expect(getByText(`${variantName} Content`)).toBeTruthy();
    });
  });

  it("should apply props to static variants", () => {
    const { getByText } = renderWithProvider(
      <AppText.H1 color="red" align="center" weight="bold">
        Styled Heading
      </AppText.H1>
    );
    const element = getByText("Styled Heading");
    expect(element.props.style).toMatchObject(expect.objectContaining({ 
      color: "red", 
      textAlign: "center", 
      fontWeight: "bold" 
    }));
  });
});
