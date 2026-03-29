import React from "react";
import { render } from "@testing-library/react-native";
import { View, Text } from "react-native";
import { TranslationErrorBoundary } from "../../src/ErrorBoundary";

// A component that throws an error
const ThrowError = () => {
  throw new Error("Test Translation Error");
};

describe("TranslationErrorBoundary", () => {
  // Silence console.error for expected error boundary catches
  const originalError = console.error;
  beforeAll(() => {
    console.error = jest.fn();
  });
  afterAll(() => {
    console.error = originalError;
  });

  it("should render children when no error occurs", () => {
    const { getByText } = render(
      <TranslationErrorBoundary>
        <Text>Safe Content</Text>
      </TranslationErrorBoundary>
    );
    expect(getByText("Safe Content")).toBeTruthy();
  });

  it("should render default fallback on error", () => {
    const { getByText } = render(
      <TranslationErrorBoundary>
        <ThrowError />
      </TranslationErrorBoundary>
    );
    // Use a case-insensitive regex for the default error message
    expect(getByText(/error occurred/i)).toBeTruthy();
  });

  it("should render custom fallback component on error", () => {
    const CustomFallback = ({ error }: any) => (
      <View>
        <Text>Custom Fallback: {error.message}</Text>
      </View>
    );

    const { getByText } = render(
      <TranslationErrorBoundary fallback={CustomFallback as any}>
        <ThrowError />
      </TranslationErrorBoundary>
    );
    expect(getByText(/Custom Fallback: Test Translation Error/)).toBeTruthy();
  });

  it("should call onError callback", () => {
    const onError = jest.fn();
    render(
      <TranslationErrorBoundary onError={onError}>
        <ThrowError />
      </TranslationErrorBoundary>
    );
    expect(onError).toHaveBeenCalledWith(expect.any(Error), expect.anything());
  });
});
