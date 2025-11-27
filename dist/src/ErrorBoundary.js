import React, { Component } from "react";
import { Text, View } from "react-native";
export class TranslationErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }
    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }
    componentDidCatch(error, errorInfo) {
        var _a, _b;
        console.error("Translation Error:", error, errorInfo);
        (_b = (_a = this.props).onError) === null || _b === void 0 ? void 0 : _b.call(_a, error, errorInfo);
    }
    render() {
        if (this.state.hasError) {
            return (this.props.fallback || (<View>
            <Text>Translation system error occurred</Text>
          </View>));
        }
        return this.props.children;
    }
}
