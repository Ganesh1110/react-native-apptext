"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.createStaticVariants = void 0;
const react_1 = __importStar(require("react"));
const createStaticVariants = (BaseAppText) => {
    return {
        // Legacy variants
        H1: (0, react_1.memo)((props) => <BaseAppText {...props} variant="h1"/>),
        H2: (0, react_1.memo)((props) => <BaseAppText {...props} variant="h2"/>),
        H3: (0, react_1.memo)((props) => <BaseAppText {...props} variant="h3"/>),
        H4: (0, react_1.memo)((props) => <BaseAppText {...props} variant="h4"/>),
        H5: (0, react_1.memo)((props) => <BaseAppText {...props} variant="h5"/>),
        H6: (0, react_1.memo)((props) => <BaseAppText {...props} variant="h6"/>),
        Title: (0, react_1.memo)((props) => <BaseAppText {...props} variant="title"/>),
        Subtitle: (0, react_1.memo)((props) => <BaseAppText {...props} variant="subtitle1"/>),
        Body: (0, react_1.memo)((props) => <BaseAppText {...props} variant="body1"/>),
        Caption: (0, react_1.memo)((props) => <BaseAppText {...props} variant="caption"/>),
        Code: (0, react_1.memo)((props) => <BaseAppText {...props} variant="code"/>),
        // Material Design 3 variants
        DisplayLarge: (0, react_1.memo)((props) => (<BaseAppText {...props} variant="displayLarge"/>)),
        DisplayMedium: (0, react_1.memo)((props) => (<BaseAppText {...props} variant="displayMedium"/>)),
        DisplaySmall: (0, react_1.memo)((props) => (<BaseAppText {...props} variant="displaySmall"/>)),
        HeadlineLarge: (0, react_1.memo)((props) => (<BaseAppText {...props} variant="headlineLarge"/>)),
        HeadlineMedium: (0, react_1.memo)((props) => (<BaseAppText {...props} variant="headlineMedium"/>)),
        HeadlineSmall: (0, react_1.memo)((props) => (<BaseAppText {...props} variant="headlineSmall"/>)),
        TitleLarge: (0, react_1.memo)((props) => (<BaseAppText {...props} variant="titleLarge"/>)),
        TitleMedium: (0, react_1.memo)((props) => (<BaseAppText {...props} variant="titleMedium"/>)),
        TitleSmall: (0, react_1.memo)((props) => (<BaseAppText {...props} variant="titleSmall"/>)),
        BodyLarge: (0, react_1.memo)((props) => (<BaseAppText {...props} variant="bodyLarge"/>)),
        BodyMedium: (0, react_1.memo)((props) => (<BaseAppText {...props} variant="bodyMedium"/>)),
        BodySmall: (0, react_1.memo)((props) => (<BaseAppText {...props} variant="bodySmall"/>)),
        LabelLarge: (0, react_1.memo)((props) => (<BaseAppText {...props} variant="labelLarge"/>)),
        LabelMedium: (0, react_1.memo)((props) => (<BaseAppText {...props} variant="labelMedium"/>)),
        LabelSmall: (0, react_1.memo)((props) => (<BaseAppText {...props} variant="labelSmall"/>)),
    };
};
exports.createStaticVariants = createStaticVariants;
