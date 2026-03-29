const React = require("react");

const Platform = {
  OS: "ios",
  select: (obj) => obj.ios || obj.default,
};

const StyleSheet = {
  create: (styles) => styles,
  flatten: (style) => style,
};

const useColorScheme = () => "light";

const Dimensions = {
  get: () => ({ width: 375, height: 667 }),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
};

const PixelRatio = {
  get: () => 2,
  getFontScale: () => 1,
  getPixelSizeForLayoutSize: (layoutSize) => layoutSize * 2,
  roundToNearestPixel: (layoutSize) => Math.round(layoutSize * 2) / 2,
};

// Mock Animated API
class AnimatedValue {
  constructor(value) {
    this._value = value;
  }

  setValue(value) {
    this._value = value;
  }

  interpolate() {
    return this;
  }
}

const Animated = {
  Value: AnimatedValue,
  View: ({ children, ...props }) =>
    React.createElement("View", props, children),
  Text: ({ children, ...props }) =>
    React.createElement("Text", props, children),
  Image: (props) => React.createElement("Image", props),
  ScrollView: ({ children, ...props }) =>
    React.createElement("ScrollView", props, children),
  timing: jest.fn(() => ({
    start: jest.fn((callback) => {
      if (callback) callback({ finished: true });
    }),
    stop: jest.fn(),
    reset: jest.fn(),
  })),
  spring: jest.fn(() => ({
    start: jest.fn((callback) => {
      if (callback) callback({ finished: true });
    }),
    stop: jest.fn(),
    reset: jest.fn(),
  })),
  sequence: jest.fn(() => ({
    start: jest.fn((callback) => {
      if (callback) callback({ finished: true });
    }),
    stop: jest.fn(),
    reset: jest.fn(),
  })),
  parallel: jest.fn(() => ({
    start: jest.fn((callback) => {
      if (callback) callback({ finished: true });
    }),
    stop: jest.fn(),
    reset: jest.fn(),
  })),
  stagger: jest.fn(() => ({
    start: jest.fn((callback) => {
      if (callback) callback({ finished: true });
    }),
    stop: jest.fn(),
    reset: jest.fn(),
  })),
  loop: jest.fn(() => ({
    start: jest.fn(),
    stop: jest.fn(),
    reset: jest.fn(),
  })),
  delay: jest.fn(() => ({
    start: jest.fn((callback) => {
      if (callback) callback({ finished: true });
    }),
  })),
  createAnimatedComponent: (component) => component,
  event: jest.fn(() => jest.fn()),
};

module.exports = {
  Platform,
  StyleSheet,
  useColorScheme,
  Dimensions,
  PixelRatio,
  Animated,
  Text: ({ children, ...props }) =>
    React.createElement("Text", props, children),
  View: ({ children, ...props }) =>
    React.createElement("View", props, children),
  TouchableOpacity: ({ children, ...props }) =>
    React.createElement("TouchableOpacity", props, children),
  Image: (props) => React.createElement("Image", props),
  ScrollView: ({ children, ...props }) =>
    React.createElement("ScrollView", props, children),
  FlatList: ({ children, ...props }) =>
    React.createElement("FlatList", props, children),
  TextInput: (props) => React.createElement("TextInput", props),
};
