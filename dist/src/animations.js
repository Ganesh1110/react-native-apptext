import { Animated } from "react-native";
export const ANIMATION_REGISTRY = {
    // === ENTRANCE ANIMATIONS ===
    fade: (v, { duration, delay }) => Animated.timing(v.opacity, {
        toValue: 1,
        duration,
        delay,
        useNativeDriver: true,
    }),
    fadeIn: (v, { duration, delay }) => Animated.timing(v.opacity, {
        toValue: 1,
        duration,
        delay,
        useNativeDriver: true,
    }),
    slideInRight: (v, { duration, delay }) => Animated.parallel([
        Animated.timing(v.opacity, {
            toValue: 1,
            duration,
            delay,
            useNativeDriver: true,
        }),
        Animated.timing(v.translateX, {
            toValue: 0,
            duration,
            delay,
            useNativeDriver: true,
        }),
    ]),
    slideInLeft: (v, { duration, delay }) => {
        v.translateX.setValue(-100);
        return Animated.parallel([
            Animated.timing(v.opacity, {
                toValue: 1,
                duration,
                delay,
                useNativeDriver: true,
            }),
            Animated.timing(v.translateX, {
                toValue: 0,
                duration,
                delay,
                useNativeDriver: true,
            }),
        ]);
    },
    slideInUp: (v, { duration, delay }) => Animated.parallel([
        Animated.timing(v.opacity, {
            toValue: 1,
            duration,
            delay,
            useNativeDriver: true,
        }),
        Animated.timing(v.translateY, {
            toValue: 0,
            duration,
            delay,
            useNativeDriver: true,
        }),
    ]),
    slideInDown: (v, { duration, delay }) => {
        v.translateY.setValue(-50);
        return Animated.parallel([
            Animated.timing(v.opacity, {
                toValue: 1,
                duration,
                delay,
                useNativeDriver: true,
            }),
            Animated.timing(v.translateY, {
                toValue: 0,
                duration,
                delay,
                useNativeDriver: true,
            }),
        ]);
    },
    bounceIn: (v, { delay }) => Animated.parallel([
        Animated.timing(v.opacity, {
            toValue: 1,
            duration: 400,
            delay,
            useNativeDriver: true,
        }),
        Animated.spring(v.scale, {
            toValue: 1,
            friction: 4,
            delay,
            useNativeDriver: true,
        }),
    ]),
    zoomIn: (v, { delay }) => Animated.parallel([
        Animated.timing(v.opacity, {
            toValue: 1,
            duration: 400,
            delay,
            useNativeDriver: true,
        }),
        Animated.spring(v.scale, {
            toValue: 1,
            friction: 4,
            delay,
            useNativeDriver: true,
        }),
    ]),
    flipInX: (v, { duration, delay }) => {
        v.rotate.setValue(-90);
        v.opacity.setValue(0);
        return Animated.parallel([
            Animated.timing(v.opacity, {
                toValue: 1,
                duration,
                delay,
                useNativeDriver: true,
            }),
            Animated.timing(v.rotate, {
                toValue: 0,
                duration,
                delay,
                useNativeDriver: true,
            }),
        ]);
    },
    flipInY: (v, { duration, delay }) => {
        v.rotate.setValue(-90);
        v.opacity.setValue(0);
        return Animated.parallel([
            Animated.timing(v.opacity, {
                toValue: 1,
                duration,
                delay,
                useNativeDriver: true,
            }),
            Animated.timing(v.rotate, {
                toValue: 0,
                duration,
                delay,
                useNativeDriver: true,
            }),
        ]);
    },
    rotateIn: (v, { duration, delay }) => {
        v.rotate.setValue(-180);
        return Animated.parallel([
            Animated.timing(v.opacity, {
                toValue: 1,
                duration,
                delay,
                useNativeDriver: true,
            }),
            Animated.timing(v.rotate, {
                toValue: 0,
                duration,
                delay,
                useNativeDriver: true,
            }),
        ]);
    },
    // === ATTENTION ANIMATIONS ===
    pulse: (v, { duration }) => Animated.loop(Animated.sequence([
        Animated.timing(v.scale, {
            toValue: 1.1,
            duration: duration / 2,
            useNativeDriver: true,
        }),
        Animated.timing(v.scale, {
            toValue: 1,
            duration: duration / 2,
            useNativeDriver: true,
        }),
    ])),
    bounce: (v, { duration }) => Animated.loop(Animated.sequence([
        Animated.timing(v.translateY, {
            toValue: -20,
            duration: duration / 2,
            useNativeDriver: true,
        }),
        Animated.timing(v.translateY, {
            toValue: 0,
            duration: duration / 2,
            useNativeDriver: true,
        }),
    ])),
    shake: (v, { duration }) => Animated.loop(Animated.sequence([
        Animated.timing(v.shake, {
            toValue: 10,
            duration: duration / 4,
            useNativeDriver: true,
        }),
        Animated.timing(v.shake, {
            toValue: -10,
            duration: duration / 2,
            useNativeDriver: true,
        }),
        Animated.timing(v.shake, {
            toValue: 0,
            duration: duration / 4,
            useNativeDriver: true,
        }),
    ])),
    rubberBand: (v, { effectiveDuration }) => Animated.loop(Animated.sequence([
        Animated.timing(v.scale, {
            toValue: 1.25,
            duration: effectiveDuration * 0.3,
            useNativeDriver: true,
        }),
        Animated.timing(v.scale, {
            toValue: 0.75,
            duration: effectiveDuration * 0.1,
            useNativeDriver: true,
        }),
        Animated.timing(v.scale, {
            toValue: 1.15,
            duration: effectiveDuration * 0.1,
            useNativeDriver: true,
        }),
        Animated.timing(v.scale, {
            toValue: 0.95,
            duration: effectiveDuration * 0.1,
            useNativeDriver: true,
        }),
        Animated.timing(v.scale, {
            toValue: 1.05,
            duration: effectiveDuration * 0.1,
            useNativeDriver: true,
        }),
        Animated.timing(v.scale, {
            toValue: 1,
            duration: effectiveDuration * 0.3,
            useNativeDriver: true,
        }),
    ])),
    tada: (v, { effectiveDuration }) => Animated.loop(Animated.sequence([
        Animated.timing(v.scale, {
            toValue: 0.9,
            duration: effectiveDuration * 0.1,
            useNativeDriver: true,
        }),
        Animated.parallel([
            Animated.timing(v.scale, {
                toValue: 1.1,
                duration: effectiveDuration * 0.1,
                useNativeDriver: true,
            }),
            Animated.timing(v.rotate, {
                toValue: -3,
                duration: effectiveDuration * 0.1,
                useNativeDriver: true,
            }),
        ]),
        Animated.timing(v.rotate, {
            toValue: 3,
            duration: effectiveDuration * 0.1,
            useNativeDriver: true,
        }),
        Animated.timing(v.rotate, {
            toValue: -3,
            duration: effectiveDuration * 0.1,
            useNativeDriver: true,
        }),
        Animated.timing(v.rotate, {
            toValue: 0,
            duration: effectiveDuration * 0.1,
            useNativeDriver: true,
        }),
        Animated.timing(v.scale, {
            toValue: 1,
            duration: effectiveDuration * 0.1,
            useNativeDriver: true,
        }),
    ])),
    swing: (v, { effectiveDuration }) => Animated.loop(Animated.sequence([
        Animated.timing(v.rotate, {
            toValue: 15,
            duration: effectiveDuration * 0.2,
            useNativeDriver: true,
        }),
        Animated.timing(v.rotate, {
            toValue: -10,
            duration: effectiveDuration * 0.2,
            useNativeDriver: true,
        }),
        Animated.timing(v.rotate, {
            toValue: 5,
            duration: effectiveDuration * 0.2,
            useNativeDriver: true,
        }),
        Animated.timing(v.rotate, {
            toValue: -5,
            duration: effectiveDuration * 0.2,
            useNativeDriver: true,
        }),
        Animated.timing(v.rotate, {
            toValue: 0,
            duration: effectiveDuration * 0.2,
            useNativeDriver: true,
        }),
    ])),
    wobble: (v, { effectiveDuration }) => Animated.loop(Animated.sequence([
        Animated.timing(v.rotate, {
            toValue: 5,
            duration: effectiveDuration * 0.2,
            useNativeDriver: true,
        }),
        Animated.timing(v.rotate, {
            toValue: -5,
            duration: effectiveDuration * 0.2,
            useNativeDriver: true,
        }),
        Animated.timing(v.rotate, {
            toValue: 3,
            duration: effectiveDuration * 0.2,
            useNativeDriver: true,
        }),
        Animated.timing(v.rotate, {
            toValue: -3,
            duration: effectiveDuration * 0.2,
            useNativeDriver: true,
        }),
        Animated.timing(v.rotate, {
            toValue: 0,
            duration: effectiveDuration * 0.2,
            useNativeDriver: true,
        }),
    ])),
    // === EXIT ANIMATIONS ===
    fadeOut: (v, { duration, delay }) => {
        v.opacity.setValue(1);
        return Animated.timing(v.opacity, {
            toValue: 0,
            duration,
            delay,
            useNativeDriver: true,
        });
    },
    slideOutRight: (v, { duration, delay }) => {
        v.opacity.setValue(1);
        v.translateX.setValue(0);
        return Animated.parallel([
            Animated.timing(v.opacity, {
                toValue: 0,
                duration,
                delay,
                useNativeDriver: true,
            }),
            Animated.timing(v.translateX, {
                toValue: 100,
                duration,
                delay,
                useNativeDriver: true,
            }),
        ]);
    },
    slideOutLeft: (v, { duration, delay }) => {
        v.opacity.setValue(1);
        v.translateX.setValue(0);
        return Animated.parallel([
            Animated.timing(v.opacity, {
                toValue: 0,
                duration,
                delay,
                useNativeDriver: true,
            }),
            Animated.timing(v.translateX, {
                toValue: -100,
                duration,
                delay,
                useNativeDriver: true,
            }),
        ]);
    },
    slideOutUp: (v, { duration, delay }) => {
        v.opacity.setValue(1);
        v.translateY.setValue(0);
        return Animated.parallel([
            Animated.timing(v.opacity, {
                toValue: 0,
                duration,
                delay,
                useNativeDriver: true,
            }),
            Animated.timing(v.translateY, {
                toValue: -50,
                duration,
                delay,
                useNativeDriver: true,
            }),
        ]);
    },
    slideOutDown: (v, { duration, delay }) => {
        v.opacity.setValue(1);
        v.translateY.setValue(0);
        return Animated.parallel([
            Animated.timing(v.opacity, {
                toValue: 0,
                duration,
                delay,
                useNativeDriver: true,
            }),
            Animated.timing(v.translateY, {
                toValue: 50,
                duration,
                delay,
                useNativeDriver: true,
            }),
        ]);
    },
    bounceOut: (v, { duration, delay }) => {
        v.opacity.setValue(1);
        v.scale.setValue(1);
        return Animated.parallel([
            Animated.timing(v.opacity, {
                toValue: 0,
                duration,
                delay,
                useNativeDriver: true,
            }),
            Animated.timing(v.scale, {
                toValue: 0.8,
                duration,
                delay,
                useNativeDriver: true,
            }),
        ]);
    },
    zoomOut: (v, { duration, delay }) => {
        v.opacity.setValue(1);
        v.scale.setValue(1);
        return Animated.parallel([
            Animated.timing(v.opacity, {
                toValue: 0,
                duration,
                delay,
                useNativeDriver: true,
            }),
            Animated.timing(v.scale, {
                toValue: 0.8,
                duration,
                delay,
                useNativeDriver: true,
            }),
        ]);
    },
    flipOutX: (v, { duration, delay }) => {
        v.opacity.setValue(1);
        v.rotate.setValue(0);
        return Animated.parallel([
            Animated.timing(v.opacity, {
                toValue: 0,
                duration,
                delay,
                useNativeDriver: true,
            }),
            Animated.timing(v.rotate, {
                toValue: 90,
                duration,
                delay,
                useNativeDriver: true,
            }),
        ]);
    },
    flipOutY: (v, { duration, delay }) => {
        v.opacity.setValue(1);
        v.rotate.setValue(0);
        return Animated.parallel([
            Animated.timing(v.opacity, {
                toValue: 0,
                duration,
                delay,
                useNativeDriver: true,
            }),
            Animated.timing(v.rotate, {
                toValue: 90,
                duration,
                delay,
                useNativeDriver: true,
            }),
        ]);
    },
    rotateOut: (v, { duration, delay }) => {
        v.opacity.setValue(1);
        v.rotate.setValue(0);
        return Animated.parallel([
            Animated.timing(v.opacity, {
                toValue: 0,
                duration,
                delay,
                useNativeDriver: true,
            }),
            Animated.timing(v.rotate, {
                toValue: 180,
                duration,
                delay,
                useNativeDriver: true,
            }),
        ]);
    },
    // === SPECIAL EFFECTS ===
    blink: (v, { duration }) => Animated.loop(Animated.sequence([
        Animated.timing(v.opacity, {
            toValue: 0,
            duration: duration / 2,
            useNativeDriver: true,
        }),
        Animated.timing(v.opacity, {
            toValue: 1,
            duration: duration / 2,
            useNativeDriver: true,
        }),
    ])),
    glow: (v, { duration }) => Animated.loop(Animated.sequence([
        Animated.timing(v.glow, {
            toValue: 1,
            duration: duration / 2,
            useNativeDriver: false,
        }),
        Animated.timing(v.glow, {
            toValue: 0,
            duration: duration / 2,
            useNativeDriver: false,
        }),
    ])),
    neon: (v, { duration }) => Animated.loop(Animated.sequence([
        Animated.timing(v.neon, {
            toValue: 1,
            duration: duration / 2,
            useNativeDriver: false,
        }),
        Animated.timing(v.neon, {
            toValue: 0.5,
            duration: duration / 2,
            useNativeDriver: false,
        }),
    ])),
    gradientShift: (v) => Animated.loop(Animated.timing(v.gradient, {
        toValue: 1,
        duration: 3000,
        useNativeDriver: false,
    })),
};
