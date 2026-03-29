import React, { memo } from "react";
export const createStaticVariants = (BaseAppText) => {
    return {
        // Legacy variants
        H1: memo((props) => <BaseAppText {...props} variant="h1"/>),
        H2: memo((props) => <BaseAppText {...props} variant="h2"/>),
        H3: memo((props) => <BaseAppText {...props} variant="h3"/>),
        H4: memo((props) => <BaseAppText {...props} variant="h4"/>),
        H5: memo((props) => <BaseAppText {...props} variant="h5"/>),
        H6: memo((props) => <BaseAppText {...props} variant="h6"/>),
        Title: memo((props) => <BaseAppText {...props} variant="title"/>),
        Subtitle: memo((props) => <BaseAppText {...props} variant="subtitle1"/>),
        Body: memo((props) => <BaseAppText {...props} variant="body1"/>),
        Caption: memo((props) => <BaseAppText {...props} variant="caption"/>),
        Code: memo((props) => <BaseAppText {...props} variant="code"/>),
        // Material Design 3 variants
        DisplayLarge: memo((props) => (<BaseAppText {...props} variant="displayLarge"/>)),
        DisplayMedium: memo((props) => (<BaseAppText {...props} variant="displayMedium"/>)),
        DisplaySmall: memo((props) => (<BaseAppText {...props} variant="displaySmall"/>)),
        HeadlineLarge: memo((props) => (<BaseAppText {...props} variant="headlineLarge"/>)),
        HeadlineMedium: memo((props) => (<BaseAppText {...props} variant="headlineMedium"/>)),
        HeadlineSmall: memo((props) => (<BaseAppText {...props} variant="headlineSmall"/>)),
        TitleLarge: memo((props) => (<BaseAppText {...props} variant="titleLarge"/>)),
        TitleMedium: memo((props) => (<BaseAppText {...props} variant="titleMedium"/>)),
        TitleSmall: memo((props) => (<BaseAppText {...props} variant="titleSmall"/>)),
        BodyLarge: memo((props) => (<BaseAppText {...props} variant="bodyLarge"/>)),
        BodyMedium: memo((props) => (<BaseAppText {...props} variant="bodyMedium"/>)),
        BodySmall: memo((props) => (<BaseAppText {...props} variant="bodySmall"/>)),
        LabelLarge: memo((props) => (<BaseAppText {...props} variant="labelLarge"/>)),
        LabelMedium: memo((props) => (<BaseAppText {...props} variant="labelMedium"/>)),
        LabelSmall: memo((props) => (<BaseAppText {...props} variant="labelSmall"/>)),
    };
};
