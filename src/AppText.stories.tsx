import React from "react";
import { View, TextStyle } from "react-native";
import AppText from "./AppText";
import { AppTextSkeleton } from "./AppTextSkeleton";

const Container = ({ children }: { children: React.ReactNode }) => (
  <View style={{ padding: 16, backgroundColor: "#fff" }}>{children}</View>
);

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <View style={{ marginBottom: 24 }}>
    <AppText.HeadlineSmall style={{ marginBottom: 12, color: "#333" }}>
      {title}
    </AppText.HeadlineSmall>
    {children}
  </View>
);

const Row = ({ children }: { children: React.ReactNode }) => (
  <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>{children}</View>
);

export default {
  title: "AppText/Typography",
  component: AppText,
  parameters: {
    layout: "padded",
  },
};

export const DisplayVariants = () => (
  <Container>
    <Section title="Display (MD3)">
      <AppText.DisplayLarge>Display Large</AppText.DisplayLarge>
      <AppText.DisplayMedium>Display Medium</AppText.DisplayMedium>
      <AppText.DisplaySmall>Display Small</AppText.DisplaySmall>
    </Section>
  </Container>
);

export const HeadlineVariants = () => (
  <Container>
    <Section title="Headline (MD3)">
      <AppText.HeadlineLarge>Headline Large</AppText.HeadlineLarge>
      <AppText.HeadlineMedium>Headline Medium</AppText.HeadlineMedium>
      <AppText.HeadlineSmall>Headline Small</AppText.HeadlineSmall>
    </Section>
  </Container>
);

export const TitleVariants = () => (
  <Container>
    <Section title="Title (MD3)">
      <AppText.TitleLarge>Title Large</AppText.TitleLarge>
      <AppText.TitleMedium>Title Medium</AppText.TitleMedium>
      <AppText.TitleSmall>Title Small</AppText.TitleSmall>
    </Section>
  </Container>
);

export const BodyVariants = () => (
  <Container>
    <Section title="Body (MD3)">
      <AppText.BodyLarge>Body Large - The quick brown fox jumps over the lazy dog</AppText.BodyLarge>
      <AppText.BodyMedium>Body Medium - The quick brown fox jumps over the lazy dog</AppText.BodyMedium>
      <AppText.BodySmall>Body Small - The quick brown fox jumps over the lazy dog</AppText.BodySmall>
    </Section>
  </Container>
);

export const LabelVariants = () => (
  <Container>
    <Section title="Label (MD3)">
      <AppText.LabelLarge>Label Large</AppText.LabelLarge>
      <AppText.LabelMedium>Label Medium</AppText.LabelMedium>
      <AppText.LabelSmall>Label Small</AppText.LabelSmall>
    </Section>
  </Container>
);

export const StyledText = () => (
  <Container>
    <Section title="Styled Text">
      <AppText variant="headlineMedium" color="primary" weight="700">
        Bold Primary Text
      </AppText>
      <AppText variant="titleMedium" color="#FF6B6B" italic>
        Italic Custom Color
      </AppText>
      <AppText variant="bodyLarge" color="#333" align="center">
        Center Aligned Text
      </AppText>
    </Section>
  </Container>
);

export const Animations = () => (
  <Container>
    <Section title="Animations">
      <AppText animated animation={{ type: "fade", duration: 600 }}>
        Fade In Animation
      </AppText>
      <AppText animated animation={{ type: "bounce" }} style={{ marginTop: 8 }}>
        Bounce Animation
      </AppText>
      <AppText animated animation={{ type: "pulse" }} style={{ marginTop: 8 }}>
        Pulse Animation
      </AppText>
      <AppText animated animation={{ type: "wave" }} style={{ marginTop: 8 }}>
        Wave Animation
      </AppText>
    </Section>
  </Container>
);

export const SkeletonLoaders = () => (
  <Container>
    <Section title="Skeleton Loaders">
      <AppTextSkeleton variant="headlineMedium" width={200} />
      <AppTextSkeleton variant="bodyLarge" lines={2} style={{ marginTop: 8 }} />
      <AppTextSkeleton variant="bodyMedium" width="60%" style={{ marginTop: 8 }} />
    </Section>
  </Container>
);

export const Internationalization = () => (
  <Container>
    <Section title="i18n">
      <AppText>{`{{greeting}}`}</AppText>
      <AppText>{`You have {{count}} items`}</AppText>
    </Section>
  </Container>
);

export const AllVariants = () => (
  <Container>
    <Section title="All Material Design 3 Variants">
      <Row>
        <AppText.DisplayLarge>DisplayLarge</AppText.DisplayLarge>
      </Row>
      <Row>
        <AppText.DisplayMedium>DisplayMedium</AppText.DisplayMedium>
      </Row>
      <Row>
        <AppText.DisplaySmall>DisplaySmall</AppText.DisplaySmall>
      </Row>
      <Row>
        <AppText.HeadlineLarge>HeadlineLarge</AppText.HeadlineLarge>
      </Row>
      <Row>
        <AppText.HeadlineMedium>HeadlineMedium</AppText.HeadlineMedium>
      </Row>
      <Row>
        <AppText.HeadlineSmall>HeadlineSmall</AppText.HeadlineSmall>
      </Row>
      <Row>
        <AppText.TitleLarge>TitleLarge</AppText.TitleLarge>
      </Row>
      <Row>
        <AppText.TitleMedium>TitleMedium</AppText.TitleMedium>
      </Row>
      <Row>
        <AppText.TitleSmall>TitleSmall</AppText.TitleSmall>
      </Row>
      <Row>
        <AppText.BodyLarge>BodyLarge</AppText.BodyLarge>
      </Row>
      <Row>
        <AppText.BodyMedium>BodyMedium</AppText.BodyMedium>
      </Row>
      <Row>
        <AppText.BodySmall>BodySmall</AppText.BodySmall>
      </Row>
      <Row>
        <AppText.LabelLarge>LabelLarge</AppText.LabelLarge>
      </Row>
      <Row>
        <AppText.LabelMedium>LabelMedium</AppText.LabelMedium>
      </Row>
      <Row>
        <AppText.LabelSmall>LabelSmall</AppText.LabelSmall>
      </Row>
    </Section>
  </Container>
);