import * as React from "react";
import { Badge } from "../../components/Badge";
import { Card } from "../../components/Card";
import { Icon, type IconProps } from "../../components/Icon";
import { Skeleton } from "../../components/Skeleton";
import { Text } from "../../components/Text";
import styles from "./StatsCard.module.scss";

// ============================================
// Types
// ============================================

export type StatsCardChangeTone = "neutral" | "success" | "danger";

export interface StatsCardProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  /** Metric label displayed above the value */
  title: string;
  /** The primary metric value. Null or undefined shows an em dash in ink 3. */
  value?: string | number | null;
  /** Change text; words carry the direction (e.g. "+12.5%") */
  change?: string;
  /** Whether the change is good (`success`) or bad (`danger`). Neutral unless the caller says.
   * @default "neutral" */
  changeTone?: StatsCardChangeTone;
  /** An icon component (Phosphor or any SVG component), drawn neutral in a tile */
  icon?: IconProps["icon"];
  /** Shows a skeleton in place of the value and change */
  loading?: boolean;
}

// ============================================
// Component
// ============================================

export const StatsCard = React.forwardRef<HTMLDivElement, StatsCardProps>(function StatsCard(
  { title, value, change, changeTone = "neutral", icon, loading = false, className, ...htmlProps },
  ref
) {
  const empty = value === undefined || value === null || value === "";

  return (
    <div ref={ref} {...htmlProps} className={[styles.root, className].filter(Boolean).join(" ")}>
      <Card>
        <Card.Body>
          <div className={styles.layout}>
            <div className={styles.figures} aria-busy={loading || undefined}>
              <Text color="tertiary">{title}</Text>
              {loading ? (
                <>
                  <Skeleton shape="heading" width="60%" />
                  <Skeleton shape="text" width="30%" />
                </>
              ) : (
                <>
                  <Text as="p" type="display" tabularNums color={empty ? "tertiary" : undefined}>
                    {empty ? "—" : value}
                  </Text>
                  {change && (
                    <span className={styles.change}>
                      <Badge tone={changeTone}>{change}</Badge>
                    </span>
                  )}
                </>
              )}
            </div>
            {icon && (
              <span className={styles.tile} aria-hidden="true">
                <Icon icon={icon} size="md" tone="secondary" />
              </span>
            )}
          </div>
        </Card.Body>
      </Card>
    </div>
  );
});
