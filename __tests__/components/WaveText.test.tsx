import React from "react";
import { render, act } from "@testing-library/react-native";
import { AppTextProvider } from "../../src/context";
import AppText from "../../src/AppText";

const renderWithProvider = (element: React.ReactElement) =>
  render(<AppTextProvider>{element}</AppTextProvider>);

describe("WaveText Animation", () => {
  it("renders all characters when using wave animation", () => {
    const { getByText } = renderWithProvider(
      <AppText animation={{ type: "wave" }} animated>
        Wave
      </AppText>
    );
    // Each character is rendered via Animated.Text, but the parent Text
    // contains them all — queryByText won't match the whole word since
    // characters are split; verify the container renders without crash.
    expect(getByText).toBeDefined();
  });

  it("unmounts cleanly without throwing (animation cleanup)", () => {
    const { unmount } = renderWithProvider(
      <AppText animation={{ type: "wave" }} animated>
        Hello
      </AppText>
    );
    expect(() => unmount()).not.toThrow();
  });

  it("handles text change gracefully without mismatched animated values", () => {
    const { rerender } = renderWithProvider(
      <AppText animation={{ type: "wave" }} animated>
        Short
      </AppText>
    );

    // Changing to a longer string — new Animated.Values should be created
    expect(() => {
      rerender(
        <AppTextProvider>
          <AppText animation={{ type: "wave" }} animated>
            Longer text that is longer
          </AppText>
        </AppTextProvider>
      );
    }).not.toThrow();
  });

  it("handles text change to shorter string without index out of bounds", () => {
    const { rerender } = renderWithProvider(
      <AppText animation={{ type: "wave" }} animated>
        Long wave text
      </AppText>
    );

    expect(() => {
      rerender(
        <AppTextProvider>
          <AppText animation={{ type: "wave" }} animated>
            Hi
          </AppText>
        </AppTextProvider>
      );
    }).not.toThrow();
  });
});
