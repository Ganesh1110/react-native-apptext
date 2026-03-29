import React, { Component, ErrorInfo, ReactNode } from "react";
import { Text, View, TextStyle } from "react-native";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  fallbackText?: string;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  style?: TextStyle;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

const DEFAULT_FALLBACK_TEXT = "An error occurred in the translation system.";

export class TranslationErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Translation Error:", error, errorInfo);
    this.props.onError?.(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <View
            style={[
              this.props.style,
              { padding: 10, backgroundColor: "#FF000010" },
            ]}
          >
            <Text style={{ color: "#FF0000" }}>
              {this.props.fallbackText || DEFAULT_FALLBACK_TEXT}
            </Text>
          </View>
        )
      );
    }

    return this.props.children;
  }
}

export default TranslationErrorBoundary;
