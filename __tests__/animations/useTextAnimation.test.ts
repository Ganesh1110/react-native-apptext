import { renderHook } from "@testing-library/react-native";
import { useTextAnimation } from "../../src/animations/useTextAnimation";
import { AnimationWithConfig } from "../../src/types";

describe("useTextAnimation Hook", () => {
  it("should return animated styles for 'none' animation", () => {
    const { result } = renderHook(() => useTextAnimation(true, "none"));
    expect(result.current.animatedStyle).toBeDefined();
  });

  it("should handle animation as a boolean (fade)", () => {
    const { result } = renderHook(() => useTextAnimation(true, true));
    expect(result.current.animatedStyle).toBeDefined();
  });

  it("should handle animation as a string type (entrance)", () => {
    const entranceAnimations = ["fadeIn", "slideInRight", "bounceIn", "zoomIn", "flipInX", "rotateIn"];

    entranceAnimations.forEach(type => {
      const { result } = renderHook(() => useTextAnimation(true, type as any));
      expect(result.current.animatedStyle).toBeDefined();
    });
  });

  it("should handle attention animations", () => {
    const attentionAnimations = ["pulse", "bounce", "shake", "swing", "wobble", "rubberBand", "tada"];

    attentionAnimations.forEach(type => {
      const { result } = renderHook(() => useTextAnimation(true, type as any));
      expect(result.current.animatedStyle).toBeDefined();
    });
  });

  it("should handle exit animations", () => {
    const exitAnimations = ["fadeOut", "slideOutLeft", "bounceOut", "zoomOut", "flipOutY"];

    exitAnimations.forEach(type => {
      const { result } = renderHook(() => useTextAnimation(true, type as any));
      expect(result.current.animatedStyle).toBeDefined();
    });
  });

  it("should handle special animations (blink, glow, neon)", () => {
    const specialAnimations = ["blink", "glow", "neon"];

    specialAnimations.forEach(type => {
      const { result } = renderHook(() => useTextAnimation(true, type as any));
      expect(result.current.animatedStyle).toBeDefined();
    });
  });

  it("should handle animation with configuration object", () => {
    const config: AnimationWithConfig = {
      type: "fadeIn",
      duration: 500,
      delay: 100
    };
    const { result } = renderHook(() => useTextAnimation(true, config));
    expect(result.current.animatedStyle).toBeDefined();
  });
});
