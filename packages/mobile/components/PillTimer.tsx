import { View, Text, StyleSheet, useColorScheme, Animated } from 'react-native';
import { useRef, useEffect } from 'react';
import type { TimerStatus } from '@pinepomo/core';

interface PillTimerProps {
  remainingSeconds: number;
  totalSeconds: number;
  status: TimerStatus | 'idle';
  taskName?: string;
}

const statusConfig = {
  idle: {
    label: 'Ready',
  },
  running: {
    label: 'Focus',
  },
  paused: {
    label: 'Paused',
  },
  completed: {
    label: 'Complete',
  },
  cancelled: {
    label: 'Cancelled',
  },
};

export function PillTimer({
  remainingSeconds,
  totalSeconds,
  status,
  taskName,
}: PillTimerProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = isDark ? darkColors : lightColors;

  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;
  const progress = totalSeconds > 0 ? ((totalSeconds - remainingSeconds) / totalSeconds) * 100 : 0;

  const formatTime = (n: number) => n.toString().padStart(2, '0');
  const config = statusConfig[status];

  // Animated width value
  const fillAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fillAnim, {
      toValue: progress,
      duration: 500,
      useNativeDriver: false,
    }).start();
  }, [progress, fillAnim]);

  // Get status-based colors
  const getStatusColors = () => {
    switch (status) {
      case 'running':
        return { border: colors.primary, fill: colors.primaryFill };
      case 'paused':
        return { border: colors.accent, fill: colors.accentFill };
      case 'completed':
        return { border: colors.success, fill: colors.successFill };
      default:
        return { border: colors.border, fill: 'transparent' };
    }
  };

  const statusColors = getStatusColors();

  const fillWidth = fillAnim.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  });

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.card,
          borderColor: statusColors.border,
        },
      ]}
    >
      {/* Background fill - fills from left as time passes */}
      <Animated.View
        style={[
          styles.fill,
          {
            backgroundColor: statusColors.fill,
            width: fillWidth,
          },
        ]}
      />

      {/* Time display */}
      <Text style={[styles.time, { color: colors.text }]}>
        {formatTime(minutes)}:{formatTime(seconds)}
      </Text>

      {/* Status badge */}
      <Text
        style={[styles.label, { color: colors.textSecondary }]}
        numberOfLines={1}
      >
        {taskName || config.label}
      </Text>
    </View>
  );
}

const lightColors = {
  card: '#ffffff',
  text: '#1a1a1a',
  textSecondary: '#6b7280',
  border: '#d1d5db',
  primary: '#16a34a',
  primaryFill: 'rgba(22, 163, 74, 0.2)',
  accent: '#d97706',
  accentFill: 'rgba(217, 119, 6, 0.2)',
  success: '#059669',
  successFill: 'rgba(5, 150, 105, 0.2)',
};

const darkColors = {
  card: '#1e1e2e',
  text: '#ffffff',
  textSecondary: '#9ca3af',
  border: '#374151',
  primary: '#22c55e',
  primaryFill: 'rgba(34, 197, 94, 0.25)',
  accent: '#f59e0b',
  accentFill: 'rgba(245, 158, 11, 0.25)',
  success: '#10b981',
  successFill: 'rgba(16, 185, 129, 0.25)',
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    minWidth: 280,
    maxWidth: 360,
    width: '90%',
    paddingHorizontal: 48,
    paddingVertical: 32,
    borderRadius: 999,
    borderWidth: 2,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fill: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
  },
  time: {
    fontSize: 52,
    fontWeight: '200',
    fontVariant: ['tabular-nums'],
    letterSpacing: -1,
  },
  label: {
    marginTop: 8,
    fontSize: 12,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 2,
    maxWidth: '100%',
  },
});
