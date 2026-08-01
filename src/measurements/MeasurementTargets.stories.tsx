import type { Meta, StoryObj } from "@storybook/react";

import { MEASUREMENT_PROFILES, type MeasurementDensity } from "./generated";
import styles from "./MeasurementTargets.module.scss";

type StorybookTheme = "light" | "dark";
type ControlTrack = keyof typeof MEASUREMENT_PROFILES.targets.controlTrack;
type FieldTrack = keyof typeof MEASUREMENT_PROFILES.targets.fieldTrack;
type TypographyRole = keyof typeof MEASUREMENT_PROFILES.typography;

type TargetLineupArgs = {
  density: MeasurementDensity;
};

const CONTROL_TRACK_CLASSES: Record<ControlTrack, string> = {
  micro: styles.controlTrackMicro,
  sm: styles.controlTrackSm,
  md: styles.controlTrackMd,
  lg: styles.controlTrackLg,
};

const FIELD_TRACK_CLASSES: Record<FieldTrack, string> = {
  sm: styles.fieldTrackSm,
  md: styles.fieldTrackMd,
  lg: styles.fieldTrackLg,
};

const TYPOGRAPHY_CLASSES: Record<TypographyRole, string> = {
  caption: styles.caption,
  "ui-compact": styles.uiCompact,
  "ui-standard": styles.uiStandard,
  "body-compact": styles.bodyCompact,
  "body-relaxed": styles.bodyRelaxed,
  "title-sm": styles.titleSm,
  "title-md": styles.titleMd,
  "title-lg": styles.titleLg,
  code: styles.code,
};

const meta = {
  title: "Foundations/Measurement Targets",
  parameters: {
    layout: "fullscreen",
    backgrounds: { disable: true },
    docs: {
      description: {
        component:
          "Generated target-lineup evidence. These specimens expose dormant measurement roles without switching a production component to them.",
      },
    },
  },
  args: {
    density: "default",
  },
  argTypes: {
    density: {
      control: "select",
      options: ["compact", "default", "relaxed"],
      description:
        "Selects the surrounding density profile; fixed target and typography roles must not change.",
    },
  },
} satisfies Meta<TargetLineupArgs>;

export default meta;

type Story = StoryObj<TargetLineupArgs>;

function resolveTheme(value: unknown): StorybookTheme {
  return value === "dark" ? "dark" : "light";
}

function ControlTracks() {
  return (
    <section className={styles.section} aria-labelledby="measurement-control-tracks">
      <h2 className={styles.sectionTitle} id="measurement-control-tracks">
        Control tracks
      </h2>
      <div className={styles.specimenList}>
        {Object.entries(MEASUREMENT_PROFILES.targets.controlTrack).map(([name, value]) => {
          const track = name as ControlTrack;
          return (
            <div className={styles.specimenRow} key={track}>
              <div className={styles.specimenMeta}>
                <p className={styles.specimenName}>{track}</p>
                <p className={styles.specimenValue}>{value}</p>
              </div>
              <div
                className={`${styles.controlTrack} ${CONTROL_TRACK_CLASSES[track]}`}
                data-geometry-control-track={track}
                data-geometry-id={`target-control-track-${track}`}
              >
                {track} control
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function FieldTracks() {
  return (
    <section className={styles.section} aria-labelledby="measurement-field-tracks">
      <h2 className={styles.sectionTitle} id="measurement-field-tracks">
        Field tracks
      </h2>
      <div className={styles.specimenList}>
        {Object.entries(MEASUREMENT_PROFILES.targets.fieldTrack).map(([name, value]) => {
          const track = name as FieldTrack;
          return (
            <div className={styles.specimenRow} key={track}>
              <div className={styles.specimenMeta}>
                <p className={styles.specimenName}>{track}</p>
                <p className={styles.specimenValue}>{value}</p>
              </div>
              <div
                className={`${styles.fieldTrack} ${FIELD_TRACK_CLASSES[track]}`}
                data-geometry-field-track={track}
                data-geometry-id={`target-field-track-${track}`}
              >
                Field value
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function TypographyTargets() {
  return (
    <section className={styles.section} aria-labelledby="measurement-typography-targets">
      <h2 className={styles.sectionTitle} id="measurement-typography-targets">
        Typography roles
      </h2>
      <div className={styles.specimenList}>
        {Object.entries(MEASUREMENT_PROFILES.typography).map(([name, values]) => {
          const role = name as TypographyRole;
          return (
            <div className={styles.typographySpecimen} key={role}>
              <div className={styles.specimenMeta}>
                <p className={styles.specimenName}>{role}</p>
                <p className={styles.specimenValue}>
                  {values.size}/{values.line} · {values.weight} · {values.tracking}
                </p>
              </div>
              <p
                className={`${styles.typographySample} ${TYPOGRAPHY_CLASSES[role]}`}
                data-geometry-typography={role}
                data-geometry-id={`target-typography-${role}`}
              >
                Sphinx of black quartz, judge my vow.
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export const TargetLineup: Story = {
  render: ({ density }, context) => {
    const theme = resolveTheme(context.globals.theme);

    return (
      <main
        className={styles.lineup}
        data-fui-density={density}
        data-geometry-target-lineup="root"
        data-geometry-density={density}
        data-geometry-theme={theme}
      >
        <header className={styles.header}>
          <p className={styles.eyebrow}>Measurement foundation</p>
          <h1 className={styles.title}>Target lineup</h1>
          <p className={styles.description}>
            Fixed geometry and semantic type evidence. Density and theme may change the surrounding
            surface, but these target values remain identical.
          </p>
          <div className={styles.context} role="group" aria-label="Active evidence context">
            <span className={styles.contextValue}>density: {density}</span>
            <span className={styles.contextValue}>theme: {theme}</span>
          </div>
        </header>

        <ControlTracks />
        <FieldTracks />
        <TypographyTargets />
      </main>
    );
  },
};
