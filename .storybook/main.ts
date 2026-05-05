import type { StorybookConfig } from "@storybook/react-native";

const config: StorybookConfig = {
  stories: ["../src/**/*.stories.?(ts|tsx|js|jsx)"],
  addons: ["@storybook/addon-ondevice-actions"],
  framework: {
    name: "@storybook/react-native",
    options: {},
  },
};

export default config;