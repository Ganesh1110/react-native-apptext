import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import { TruncationComponent } from "../../src/components/TruncationComponent";
import { AppTextProvider } from "../../src/context";

describe("TruncationComponent", () => {
  const renderWithProvider = (component: React.ReactElement) => {
    return render(<AppTextProvider>{component}</AppTextProvider>);
  };

  it("should render full text when not truncated", () => {
    const { getByText } = renderWithProvider(
      <TruncationComponent maxLines={10}>
        This is a short text
      </TruncationComponent>
    );
    expect(getByText("This is a short text")).toBeTruthy();
  });

  it("should show expand button when truncated", () => {
    const { getByText, queryByText } = renderWithProvider(
      <TruncationComponent 
        maxLines={3} 
        expandText="Read More"
      >
        This is a long text that should be truncated
      </TruncationComponent>
    );

    // Initially should not show "Read More"
    expect(queryByText("Read More")).toBeNull();

    // Mock onTextLayout to trigger truncation
    const text = getByText("This is a long text that should be truncated");
    fireEvent(text, "onTextLayout", {
      nativeEvent: { lines: new Array(5).fill({}) }
    });

    expect(getByText("Read More")).toBeTruthy();
  });

  it("should expand text when 'more' button is pressed", () => {
    const { getByText, queryByText } = renderWithProvider(
      <TruncationComponent 
        maxLines={3} 
        expandText="Read More"
        collapseText="Read Less"
      >
        This is a long text that should be truncated
      </TruncationComponent>
    );
    
    // Trigger truncation
    const text = getByText("This is a long text that should be truncated");
    fireEvent(text, "onTextLayout", {
      nativeEvent: { lines: new Array(5).fill({}) }
    });

    const moreButton = getByText("Read More");
    fireEvent.press(moreButton);
    
    expect(getByText("Read Less")).toBeTruthy();
    expect(queryByText("Read More")).toBeNull();
  });

  it("should collapse text when 'less' button is pressed", () => {
    const { getByText } = renderWithProvider(
      <TruncationComponent 
        maxLines={3} 
        expandText="Read More"
        collapseText="Read Less"
      >
        This is a long text that should be truncated
      </TruncationComponent>
    );
    
    // Trigger truncation
    const text = getByText("This is a long text that should be truncated");
    fireEvent(text, "onTextLayout", {
      nativeEvent: { lines: new Array(5).fill({}) }
    });

    // Expand
    fireEvent.press(getByText("Read More"));
    // Collapse
    fireEvent.press(getByText("Read Less"));
    
    expect(getByText("Read More")).toBeTruthy();
  });
});
