import { ReactNode, useEffect, useRef, useState } from "react";
import {
  Animated,
  KeyboardTypeOptions,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
} from "react-native";
import { colors } from "../../constants/colors";
import { spacing } from "../../constants/spacing";
import { typography } from "../../constants/typography";

interface InputProps extends TextInputProps {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  error?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  onRightIconPress?: () => void;
}

export default function Input({
  label,
  value,
  onChangeText,
  error,
  secureTextEntry,
  keyboardType,
  leftIcon,
  rightIcon,
  onRightIconPress,
  style,
  ...props
}: InputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const labelAnim = useRef(new Animated.Value(value ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(labelAnim, {
      toValue: isFocused || (value && value.length > 0) ? 1 : 0,
      duration: 180,
      useNativeDriver: false,
    }).start();
  }, [isFocused, labelAnim, value]);

  const translateY = labelAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -22],
  });

  const scale = labelAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0.82],
  });

  const labelStyle = {
    position: "absolute" as const,
    left: leftIcon ? 44 : 14,
    top: 18,
    transform: [{ translateY }, { scale }],
    color: labelAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [colors.textMuted, colors.primary],
    }),
  };

  return (
    <View style={styles.wrapper}>
      <View
        style={[
          styles.container,
          isFocused && styles.containerFocused,
          !!error && styles.containerError,
        ]}
      >
        {leftIcon ? <View style={styles.leftIcon}>{leftIcon}</View> : null}
        <Animated.Text style={[styles.label, labelStyle]}>{label}</Animated.Text>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          style={[
            styles.input,
            { paddingTop: value || isFocused ? 24 : 14 },
            leftIcon ? { paddingLeft: 0 } : null,
            style,
          ]}
          placeholder=""
          placeholderTextColor="transparent"
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType as KeyboardTypeOptions}
          {...props}
        />
        {rightIcon ? (
          <Pressable onPress={onRightIconPress} style={styles.rightIcon}>
            {rightIcon}
          </Pressable>
        ) : null}
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: spacing.xs,
  },
  container: {
    minHeight: 54,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.bgCardBorder,
    backgroundColor: colors.bgCard,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.md,
  },
  containerFocused: {
    borderColor: colors.primary,
  },
  containerError: {
    borderColor: colors.expense,
  },
  label: {
    fontFamily: typography.fontFamily.body,
    zIndex: 2,
  },
  input: {
    flex: 1,
    color: colors.textPrimary,
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.body,
    paddingBottom: 10,
  },
  leftIcon: {
    marginRight: spacing.sm,
  },
  rightIcon: {
    marginLeft: spacing.sm,
  },
  error: {
    color: colors.expense,
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.body,
  },
});
