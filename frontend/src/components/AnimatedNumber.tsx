import { useEffect, useRef, useState } from "react";
import { Text, TextStyle } from "react-native";

interface AnimatedNumberProps {
  value: number;
  prefix?: string;
  suffix?: string;
  duration?: number;
  formatter?: (n: number) => string;
  style?: TextStyle | TextStyle[];
}

export default function AnimatedNumber({
  value,
  prefix = "",
  suffix = "",
  duration = 1000,
  formatter,
  style,
}: AnimatedNumberProps) {
  const [displayed, setDisplayed] = useState(0);
  const startTimeRef = useRef<number | null>(null);
  const frameRef = useRef<number | null>(null);
  const startValueRef = useRef(0);

  useEffect(() => {
    startValueRef.current = displayed;
    startTimeRef.current = null;

    const animate = (timestamp: number) => {
      if (startTimeRef.current === null) {
        startTimeRef.current = timestamp;
      }
      const elapsed = timestamp - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = startValueRef.current + (value - startValueRef.current) * eased;
      setDisplayed(current);

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate);
      }
    };

    frameRef.current = requestAnimationFrame(animate);

    return () => {
      if (frameRef.current !== null) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [value, duration]);

  const display = formatter
    ? formatter(displayed)
    : Math.round(displayed).toLocaleString("es-CO");

  return <Text style={style}>{`${prefix}${display}${suffix}`}</Text>;
}
