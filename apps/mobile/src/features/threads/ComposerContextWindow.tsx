import type { ContextWindowSnapshot } from "@t3tools/client-runtime/state/context-window";
import { formatTokens } from "@t3tools/shared/usageFormat";
import { useGT } from "gt-react-native";
import { useState } from "react";
import Svg, { Circle } from "react-native-svg";

import { ComposerInlineControl } from "../../components/ComposerToolbar";
import { useUniwindTheme } from "../../lib/useUniwindTheme";

const RING_STROKE = 2.25;

function ContextRing(props: {
  readonly size: number;
  readonly fraction: number;
  readonly trackColor: string;
  readonly fillColor: string;
}) {
  const radius = (props.size - RING_STROKE) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = props.size / 2;
  return (
    <Svg width={props.size} height={props.size}>
      <Circle
        cx={center}
        cy={center}
        r={radius}
        stroke={props.trackColor}
        strokeWidth={RING_STROKE}
        fill="none"
      />
      <Circle
        cx={center}
        cy={center}
        r={radius}
        stroke={props.fillColor}
        strokeWidth={RING_STROKE}
        strokeLinecap="round"
        fill="none"
        strokeDasharray={`${circumference} ${circumference}`}
        strokeDashoffset={circumference * (1 - props.fraction)}
        transform={`rotate(-90 ${center} ${center})`}
      />
    </Svg>
  );
}

/** How full the thread's context window is: a ring and a percentage; tap to see token counts. */
export function ComposerContextWindow(props: {
  readonly usage: ContextWindowSnapshot;
  readonly size?: "regular" | "large";
}) {
  const gt = useGT();
  const theme = useUniwindTheme();
  const [showTokens, setShowTokens] = useState(false);
  const maxTokens =
    props.usage.maxTokens != null && props.usage.maxTokens > 0 ? props.usage.maxTokens : null;
  const usedPercent =
    maxTokens !== null && props.usage.usedPercentage !== null
      ? Math.round(Math.max(0, Math.min(100, props.usage.usedPercentage)))
      : null;
  const usedTokens = formatTokens(props.usage.usedTokens);
  const tokensLabel = maxTokens !== null ? `${usedTokens}/${formatTokens(maxTokens)}` : usedTokens;
  const label = usedPercent === null || showTokens ? tokensLabel : `${usedPercent}%`;
  const fillColor =
    usedPercent !== null && usedPercent >= 90
      ? theme["--color-danger-foreground"]
      : usedPercent !== null && usedPercent >= 75
        ? theme["--color-warning-foreground"]
        : theme["--color-foreground-muted"];

  return (
    <ComposerInlineControl
      size={props.size}
      label={label}
      showChevron={false}
      accessibilityLabel={
        usedPercent !== null
          ? gt("Context window {used}% used, {tokens} tokens", {
              used: usedPercent,
              tokens: tokensLabel,
            })
          : gt("Context window {tokens} tokens used", { tokens: tokensLabel })
      }
      accessibilityHint={showTokens ? gt("Shows the percentage") : gt("Shows token counts")}
      onPress={() => setShowTokens((current) => !current)}
      renderIcon={(iconSize) => (
        <ContextRing
          size={iconSize}
          fraction={(usedPercent ?? 0) / 100}
          trackColor={theme["--color-border"]}
          fillColor={fillColor}
        />
      )}
    />
  );
}
