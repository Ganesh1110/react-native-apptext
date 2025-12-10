// Mock React Native modules that don't exist in Node environment
// (Removed mock that requires react-native preset)

// Silence specific warnings
const originalWarn = console.warn;
const originalError = console.error;

beforeAll(() => {
  console.warn = jest.fn((...args) => {
    const message = args[0];
    // Silence specific warnings if needed
    if (typeof message === "string" && message.includes("Warning:")) {
      return;
    }
    originalWarn(...args);
  });

  console.error = jest.fn((...args) => {
    const message = args[0];
    // Silence specific errors if needed
    if (typeof message === "string" && message.includes("Not implemented:")) {
      return;
    }
    originalError(...args);
  });
});

afterAll(() => {
  console.warn = originalWarn;
  console.error = originalError;
});
