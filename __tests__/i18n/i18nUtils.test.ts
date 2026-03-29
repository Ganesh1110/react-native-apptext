import { 
  interpolate, 
  getNestedValue
} from "../../src/i18n/utils";

describe("i18n Utils", () => {
  it("should get nested values correctly", () => {
    const obj = { a: { b: { c: "val" } } };
    expect(getNestedValue(obj, "a.b.c")).toBe("val");
    expect(getNestedValue(obj, "a.x")).toBeUndefined();
    expect(getNestedValue(null as any, "a")).toBeUndefined();
  });

  it("should interpolate simple strings", () => {
    const result = interpolate("Hello {{name}}", { name: "Ganesh" });
    expect(result).toBe("Hello Ganesh");
  });

  it("should interpolate multiple variables", () => {
    const result = interpolate("{{greeting}}, {{name}}!", { 
      greeting: "Hello", 
      name: "Ganesh" 
    });
    expect(result).toBe("Hello, Ganesh!");
  });

  it("should return the entire string if placeholder is not found", () => {
    const result = interpolate("Hello {{name}}", { age: 30 });
    expect(result).toBe("Hello {{name}}");
  });

  it("should handle nested object interpolation", () => {
    const result = interpolate("Hello {{user.name}}", { 
      user: { name: "Ganesh" } 
    });
    expect(result).toBe("Hello Ganesh");
  });

  it("should warn and return match if value is an object", () => {
    const consoleSpy = jest.spyOn(console, "warn").mockImplementation();
    const result = interpolate("Hello {{user}}", { user: { name: "Ganesh" } });
    expect(result).toBe("Hello {{user}}");
    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });
});
