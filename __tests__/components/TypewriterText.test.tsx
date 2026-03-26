import React from "react";
import { render, act } from "@testing-library/react-native";
import { AppTextProvider } from "../../src/context";

// We are testing the TypewriterText component which is internal to AppText.
// We drive it by rendering AppText with the typewriter animation prop.
import AppText from "../../src/AppText";

jest.useFakeTimers();

const renderWithProvider = (element: React.ReactElement) =>
  render(<AppTextProvider>{element}</AppTextProvider>);

describe("TypewriterText Animation", () => {
  beforeEach(() => {
    jest.clearAllTimers();
  });

  it("starts with empty text and types characters progressively", () => {
    const { getByText, queryByText } = renderWithProvider(
      <AppText animation={{ type: "typewriter" }} animated>
        Hello
      </AppText>
    );

    // Initially nothing visible
    expect(queryByText("Hello")).toBeNull();

    // After 5 * 50ms = 250ms the full text should appear
    act(() => {
      jest.advanceTimersByTime(300);
    });

    expect(getByText("Hello")).toBeTruthy();
  });

  it("cleans up timers on unmount without throwing", () => {
    const { unmount } = renderWithProvider(
      <AppText animation={{ type: "typewriter" }} animated>
        Test
      </AppText>
    );

    // Unmount mid-typing — should clear all pending timers
    act(() => {
      jest.advanceTimersByTime(50);
    });

    expect(() => unmount()).not.toThrow();

    // Advancing time after unmount should not cause state updates or errors
    expect(() => {
      act(() => {
        jest.advanceTimersByTime(500);
      });
    }).not.toThrow();
  });

  it("restarts typing when text prop changes", () => {
    const { rerender, queryByText } = renderWithProvider(
      <AppText animation={{ type: "typewriter" }} animated>
        ABC
      </AppText>
    );

    act(() => {
      jest.advanceTimersByTime(200);
    });

    // Change the text — should restart from empty
    rerender(
      <AppTextProvider>
        <AppText animation={{ type: "typewriter" }} animated>
          XYZ
        </AppText>
      </AppTextProvider>
    );

    // Immediately after re-render display should have reset
    act(() => {
      jest.advanceTimersByTime(0);
    });

    // Old text should not be present
    expect(queryByText("ABC")).toBeNull();

    // After enough time new text should appear
    act(() => {
      jest.advanceTimersByTime(300);
    });
    expect(queryByText("XYZ")).toBeTruthy();
  });

  it("handles rapid text changes without orphaned timers", () => {
    const { rerender } = renderWithProvider(
      <AppText animation={{ type: "typewriter" }} animated>
        First
      </AppText>
    );

    // Rapid successive re-renders
    for (const text of ["Second", "Third", "Fourth", "Fifth"]) {
      rerender(
        <AppTextProvider>
          <AppText animation={{ type: "typewriter" }} animated>
            {text}
          </AppText>
        </AppTextProvider>
      );
    }

    expect(() => {
      act(() => {
        jest.runAllTimers();
      });
    }).not.toThrow();
  });
});
