import { useEffect, useRef, useState } from "react";
import { Text, View } from "react-native";
import Svg, { Circle } from "react-native-svg";
import { typography } from "../constants/typography";
import { colors } from "../constants/colors";

interface ProgressRingProps {
  size?: number;
  strokeWidth?: number;
  progress: number; // 0-100
  color?: string;
  trackColor?: string;
  label?: string;
  labelStyle?: object;
  duration?: number;
}

export default function ProgressRing({
  size = 64,
  strokeWidth = 6,
  progress,
  color = colors.primary,
  trackColor = colors.bgCardBorder,
  label,
  labelStyle,
  duration = 900,
}: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  const [animatedProgress, setAnimatedProgress] = useState(0);
  const startTimeRef = useRef<number | null>(null);
  const frameRef = useRef<number | null>(null);
  const targetRef = useRef(progress);

  useEffect(() => {
    targetRef.current = progress;
    startTimeRef.current = null;
    const from = animatedProgress;

    const animate = (timestamp: number) => {
      if (startTimeRef.current === null) startTimeRef.current = timestamp;
      const elapsed = timestamp - startTimeRef.current;
      const t = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setAnimatedProgress(from + (targetRef.current - from) * eased);
      if (t < 1) frameRef.current = requestAnimationFrame(animate);
    };

    frameRef.current = requestAnimationFrame(animate);
    return () => {
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [progress, duration]);

  const clampedProgress = Math.min(100, Math.max(0, animatedProgress));
  const dashOffset = circumference * (1 - clampedProgress / 100);

  return (
    <View style={{ width: size, height: size, alignItems: "center", justifyContent: "center" }}>
      <Svg width={size} height={size} style={{ position: "absolute" }}>
        {/* Track */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={trackColor}
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Progress */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      {label !== undefined ? (
        <Text
          style={[
            {
              fontFamily: typography.fontFamily.mono,
              fontSize: size > 56 ? 14 : 11,
              color: colors.textPrimary,
            },
            labelStyle,
          ]}
        >
          {label}
        </Text>
      ) : (
        <Text
          style={[
            {
              fontFamily: typography.fontFamily.mono,
              fontSize: size > 56 ? 14 : 11,
              color: colors.textPrimary,
            },
            labelStyle,
          ]}
        >
          {Math.round(clampedProgress)}%
        </Text>
      )}
    </View>
  );
}
