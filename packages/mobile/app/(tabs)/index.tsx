import {
  View,
  Text,
  Pressable,
  StyleSheet,
  TextInput,
  useColorScheme,
} from 'react-native';
import { useMemo, useEffect, useCallback, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { createTimerStore } from '@pinepomo/core';
import { CircularProgress } from '../../components/CircularProgress';

const PROGRESS_SIZE = 280;
const PROGRESS_STROKE = 12;

export default function TimerScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = isDark ? darkColors : lightColors;

  const timerStore = useMemo(() => createTimerStore(), []);
  const { session, remainingSeconds, config } = timerStore();
  const [taskName, setTaskName] = useState('');

  // Tick interval
  useEffect(() => {
    const interval = setInterval(() => {
      timerStore.getState().tick();
    }, 1000);
    return () => clearInterval(interval);
  }, [timerStore]);

  const formatTime = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, []);

  const handleStart = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    timerStore.getState().start(taskName ? { taskName } : undefined);
  };

  const handlePause = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    timerStore.getState().pause();
  };

  const handleResume = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    timerStore.getState().resume();
  };

  const handleCancel = async () => {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    timerStore.getState().cancel();
    timerStore.getState().reset();
    setTaskName('');
  };

  const status = session?.status ?? 'idle';
  const totalSeconds = config.workMins * 60;
  const displayTime = status === 'idle' ? totalSeconds : remainingSeconds;
  const progress = status === 'idle' ? 1 : remainingSeconds / totalSeconds;

  // Haptic feedback when timer completes
  useEffect(() => {
    if (status === 'completed') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  }, [status]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.primary }]}>Pinepomo</Text>

      {/* Task name input - only show when idle */}
      {status === 'idle' && (
        <TextInput
          style={[
            styles.taskInput,
            {
              backgroundColor: colors.inputBackground,
              color: colors.text,
              borderColor: colors.border,
            },
          ]}
          placeholder="What are you working on?"
          placeholderTextColor={colors.placeholder}
          value={taskName}
          onChangeText={setTaskName}
          returnKeyType="done"
        />
      )}

      {/* Task name display - show when timer is active */}
      {status !== 'idle' && session?.taskName && (
        <Text style={[styles.taskDisplay, { color: colors.textSecondary }]}>
          {session.taskName}
        </Text>
      )}

      {/* Circular progress timer */}
      <CircularProgress
        progress={progress}
        size={PROGRESS_SIZE}
        strokeWidth={PROGRESS_STROKE}
        progressColor={colors.primary}
        trackColor={colors.track}
      >
        <Text style={[styles.timer, { color: colors.text }]}>
          {formatTime(displayTime)}
        </Text>
        <Text style={[styles.status, { color: colors.textSecondary }]}>
          {status.toUpperCase()}
        </Text>
      </CircularProgress>

      {/* Controls */}
      <View style={styles.controls}>
        {status === 'idle' && (
          <Pressable
            style={({ pressed }) => [
              styles.button,
              { backgroundColor: colors.primary },
              pressed && styles.buttonPressed,
            ]}
            onPress={handleStart}
          >
            <Text style={styles.buttonText}>Start</Text>
          </Pressable>
        )}
        {status === 'running' && (
          <Pressable
            style={({ pressed }) => [
              styles.button,
              { backgroundColor: colors.primary },
              pressed && styles.buttonPressed,
            ]}
            onPress={handlePause}
          >
            <Text style={styles.buttonText}>Pause</Text>
          </Pressable>
        )}
        {status === 'paused' && (
          <>
            <Pressable
              style={({ pressed }) => [
                styles.button,
                { backgroundColor: colors.primary },
                pressed && styles.buttonPressed,
              ]}
              onPress={handleResume}
            >
              <Text style={styles.buttonText}>Resume</Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => [
                styles.button,
                styles.cancelButton,
                pressed && styles.buttonPressed,
              ]}
              onPress={handleCancel}
            >
              <Text style={styles.buttonText}>Cancel</Text>
            </Pressable>
          </>
        )}
        {status === 'completed' && (
          <Pressable
            style={({ pressed }) => [
              styles.button,
              { backgroundColor: colors.primary },
              pressed && styles.buttonPressed,
            ]}
            onPress={handleCancel}
          >
            <Text style={styles.buttonText}>Done</Text>
          </Pressable>
        )}
      </View>
    </SafeAreaView>
  );
}

const lightColors = {
  background: '#ffffff',
  primary: '#16a34a',
  text: '#1a1a1a',
  textSecondary: '#6b7280',
  placeholder: '#9ca3af',
  inputBackground: '#f3f4f6',
  border: '#e5e7eb',
  track: '#e5e7eb',
};

const darkColors = {
  background: '#1a1a2e',
  primary: '#22c55e',
  text: '#ffffff',
  textSecondary: '#9ca3af',
  placeholder: '#6b7280',
  inputBackground: '#2d2d44',
  border: '#3d3d5c',
  track: '#2d2d44',
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  taskInput: {
    width: '100%',
    maxWidth: 300,
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 16,
    fontSize: 16,
    marginBottom: 32,
  },
  taskDisplay: {
    fontSize: 16,
    marginBottom: 32,
    textAlign: 'center',
  },
  timer: {
    fontSize: 56,
    fontWeight: '200',
    fontVariant: ['tabular-nums'],
  },
  status: {
    fontSize: 14,
    marginTop: 4,
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  controls: {
    flexDirection: 'row',
    marginTop: 48,
    gap: 16,
  },
  button: {
    minWidth: 120,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 28,
    paddingHorizontal: 32,
  },
  buttonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  cancelButton: {
    backgroundColor: '#dc2626',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
});
