import { Component, ErrorInfo, ReactNode } from "react";
import { Pressable, Text, View } from "react-native";
import { colors } from "../constants/colors";
import { typography } from "../constants/typography";

interface ErrorBoundaryProps {
  children: ReactNode;
  // Optional label used by the default fallback's retry button.
  onReset?: () => void;
  resetLabel?: string;
  title?: string;
  message?: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

/**
 * Catches render-phase errors in the subtree and shows a recoverable fallback
 * instead of letting the exception bubble up and force-close the app. Scoped as
 * tightly as possible around risky screens so a fault in one screen never takes
 * down the whole navigation tree.
 */
export default class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    // Surfaced in dev logs / crash reporting; keeps a breadcrumb of what failed.
    console.error("ErrorBoundary caught an error:", error, info.componentStack);
  }

  handleReset = (): void => {
    this.setState({ hasError: false });
    this.props.onReset?.();
  };

  render(): ReactNode {
    if (!this.state.hasError) {
      return this.props.children;
    }

    return (
      <View
        style={{
          flex: 1,
          backgroundColor: colors.bg,
          alignItems: "center",
          justifyContent: "center",
          padding: 32,
        }}
      >
        <Text
          style={{
            color: colors.textPrimary,
            fontSize: 18,
            fontFamily: typography.fontFamily.headingSemiBold,
            textAlign: "center",
          }}
        >
          {this.props.title ?? "Algo salió mal"}
        </Text>
        <Text
          style={{
            marginTop: 8,
            color: colors.textSecondary,
            fontSize: 14,
            fontFamily: typography.fontFamily.body,
            textAlign: "center",
          }}
        >
          {this.props.message ?? "Ocurrió un error inesperado. Vuelve a intentarlo."}
        </Text>
        <Pressable
          onPress={this.handleReset}
          style={{
            marginTop: 24,
            height: 48,
            paddingHorizontal: 28,
            borderRadius: 14,
            backgroundColor: colors.primary,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text
            style={{
              color: colors.textInverse,
              fontSize: 15,
              fontFamily: typography.fontFamily.headingSemiBold,
            }}
          >
            {this.props.resetLabel ?? "Reintentar"}
          </Text>
        </Pressable>
      </View>
    );
  }
}
