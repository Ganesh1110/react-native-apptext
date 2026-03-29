import React, { memo } from "react";
import { AppTextProps } from "../types";

type VariantFC = React.FC<Omit<AppTextProps, "variant">>;

export const createStaticVariants = (BaseAppText: any) => {
  return {
    // Legacy variants
    H1: memo((props: any) => <BaseAppText {...props} variant="h1" />) as VariantFC,
    H2: memo((props: any) => <BaseAppText {...props} variant="h2" />) as VariantFC,
    H3: memo((props: any) => <BaseAppText {...props} variant="h3" />) as VariantFC,
    H4: memo((props: any) => <BaseAppText {...props} variant="h4" />) as VariantFC,
    H5: memo((props: any) => <BaseAppText {...props} variant="h5" />) as VariantFC,
    H6: memo((props: any) => <BaseAppText {...props} variant="h6" />) as VariantFC,
    Title: memo((props: any) => <BaseAppText {...props} variant="title" />) as VariantFC,
    Subtitle: memo((props: any) => <BaseAppText {...props} variant="subtitle1" />) as VariantFC,
    Body: memo((props: any) => <BaseAppText {...props} variant="body1" />) as VariantFC,
    Caption: memo((props: any) => <BaseAppText {...props} variant="caption" />) as VariantFC,
    Code: memo((props: any) => <BaseAppText {...props} variant="code" />) as VariantFC,

    // Material Design 3 variants
    DisplayLarge: memo((props: any) => (
      <BaseAppText {...props} variant="displayLarge" />
    )) as VariantFC,
    DisplayMedium: memo((props: any) => (
      <BaseAppText {...props} variant="displayMedium" />
    )) as VariantFC,
    DisplaySmall: memo((props: any) => (
      <BaseAppText {...props} variant="displaySmall" />
    )) as VariantFC,
    HeadlineLarge: memo((props: any) => (
      <BaseAppText {...props} variant="headlineLarge" />
    )) as VariantFC,
    HeadlineMedium: memo((props: any) => (
      <BaseAppText {...props} variant="headlineMedium" />
    )) as VariantFC,
    HeadlineSmall: memo((props: any) => (
      <BaseAppText {...props} variant="headlineSmall" />
    )) as VariantFC,
    TitleLarge: memo((props: any) => (
      <BaseAppText {...props} variant="titleLarge" />
    )) as VariantFC,
    TitleMedium: memo((props: any) => (
      <BaseAppText {...props} variant="titleMedium" />
    )) as VariantFC,
    TitleSmall: memo((props: any) => (
      <BaseAppText {...props} variant="titleSmall" />
    )) as VariantFC,
    BodyLarge: memo((props: any) => (
      <BaseAppText {...props} variant="bodyLarge" />
    )) as VariantFC,
    BodyMedium: memo((props: any) => (
      <BaseAppText {...props} variant="bodyMedium" />
    )) as VariantFC,
    BodySmall: memo((props: any) => (
      <BaseAppText {...props} variant="bodySmall" />
    )) as VariantFC,
    LabelLarge: memo((props: any) => (
      <BaseAppText {...props} variant="labelLarge" />
    )) as VariantFC,
    LabelMedium: memo((props: any) => (
      <BaseAppText {...props} variant="labelMedium" />
    )) as VariantFC,
    LabelSmall: memo((props: any) => (
      <BaseAppText {...props} variant="labelSmall" />
    )) as VariantFC,
  };
};
