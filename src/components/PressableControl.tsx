import React, { useState } from 'react';
import {
  Platform,
  Pressable,
  PressableProps,
  StyleProp,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { ThemePalette } from '../theme/palette';

interface PressableControlProps extends Omit<PressableProps, 'style'> {
  palette: ThemePalette;
  accessibilityLabel: string;
  style?: StyleProp<ViewStyle>;
  activeStyle?: StyleProp<ViewStyle>;
  children: React.ReactNode;
}

export function PressableControl({
  palette,
  accessibilityLabel,
  disabled,
  style,
  activeStyle,
  children,
  ...rest
}: PressableControlProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const webCursorStyle =
    Platform.OS === 'web'
      ? ({
          cursor: disabled ? 'not-allowed' : 'pointer',
          outlineStyle: 'none',
        } as unknown as ViewStyle)
      : null;

  return (
    <Pressable
      {...rest}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled: !!disabled }}
      onFocus={(e) => {
        setIsFocused(true);
        rest.onFocus?.(e);
      }}
      onBlur={(e) => {
        setIsFocused(false);
        rest.onBlur?.(e);
      }}
      onHoverIn={(e) => {
        setIsHovered(true);
        rest.onHoverIn?.(e);
      }}
      onHoverOut={(e) => {
        setIsHovered(false);
        rest.onHoverOut?.(e);
      }}
      style={({ pressed }) => [
        styles.baseTarget,
        style,
        (isHovered || pressed) && !disabled && {
          backgroundColor: palette.surfacePressed,
        },
        pressed && !disabled && styles.pressedTransform,
        pressed && !disabled && activeStyle,
        isFocused && {
          borderColor: palette.focusRing,
          borderWidth: 2,
        },
        disabled && styles.disabledState,
        webCursorStyle,
      ]}
    >
      {children}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  baseTarget: {
    minHeight: 48,
    minWidth: 48,
    justifyContent: 'center',
  },
  pressedTransform: {
    opacity: 0.92,
  },
  disabledState: {
    opacity: 0.55,
  },
});

