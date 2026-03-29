import { 
  isString, 
  isObject, 
  isNumber, 
  isBoolean, 
  isFunction, 
  isArray 
} from "../src/typeGuards";

describe("Type Guards Utility", () => {
  it("should correctly identify strings", () => {
    expect(isString("hello")).toBe(true);
    expect(isString(123)).toBe(false);
    expect(isString({})).toBe(false);
  });

  it("should correctly identify objects", () => {
    expect(isObject({})).toBe(true);
    expect(isObject(null)).toBe(false);
    expect(isObject([])).toBe(true); // Arrays are objects in JS
    expect(isObject("string")).toBe(false);
  });

  it("should correctly identify numbers", () => {
    expect(isNumber(123)).toBe(true);
    expect(isNumber("123")).toBe(false);
    expect(isNumber(NaN)).toBe(true); // NaN is a number type
  });

  it("should correctly identify booleans", () => {
    expect(isBoolean(true)).toBe(true);
    expect(isBoolean(false)).toBe(true);
    expect(isBoolean(0)).toBe(false);
  });

  it("should correctly identify functions", () => {
    expect(isFunction(() => {})).toBe(true);
    expect(isFunction({})).toBe(false);
  });

  it("should correctly identify arrays", () => {
    expect(isArray([])).toBe(true);
    expect(isArray({})).toBe(false);
    expect(isArray("hello")).toBe(false);
  });
});
